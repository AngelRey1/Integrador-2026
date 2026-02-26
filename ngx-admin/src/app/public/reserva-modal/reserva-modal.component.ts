import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteFirebaseService, Entrenador, Reserva } from '../../@core/services/cliente-firebase.service';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { StripeService, PaymentResult } from '../../@core/services/stripe.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Paso {
  numero: number;
  titulo: string;
  icono: string;
  completado: boolean;
}

interface Horario {
  hora: string;
  disponible: boolean;
}

// Rango de disponibilidad del entrenador para un día
interface RangoDisponibilidad {
  inicio: string;
  fin: string;
  capacidad: number;
  tipoSesion: 'individual' | 'grupal' | 'ambos';
}

// Sesión individual seleccionada
interface SesionSeleccionada {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
}

// Día del calendario
interface DiaCalendario {
  fecha: Date;
  dia: number;
  disponible: boolean;
  seleccionado: boolean;
  esMesActual: boolean;
  esHoy: boolean;
}

@Component({
  selector: 'ngx-reserva-modal',
  templateUrl: './reserva-modal.component.html',
  styleUrls: ['./reserva-modal.component.scss']
})
export class ReservaModalComponent implements OnInit, OnDestroy {
  pasoActual = 1;
  totalPasos = 5;
  fechaMinima: string;
  entrenador: Entrenador | null = null;
  cargandoEntrenador = true;
  horariosOcupados: string[] = [];
  private subscriptions: Subscription[] = [];
  isLoggedIn = false;

  pasos: Paso[] = [
    { numero: 1, titulo: 'Fecha y Hora', icono: 'calendar-outline', completado: false },
    { numero: 2, titulo: 'Ubicación', icono: 'pin-outline', completado: false },
    { numero: 3, titulo: 'Tus Datos', icono: 'person-outline', completado: false },
    { numero: 4, titulo: 'Pago', icono: 'credit-card-outline', completado: false },
    { numero: 5, titulo: 'Confirmación', icono: 'checkmark-circle-outline', completado: false }
  ];

  // Forms por paso
  paso1Form: FormGroup;
  paso2Form: FormGroup;
  paso3Form: FormGroup;
  paso4Form: FormGroup;

  // Opciones
  horariosDisponibles: Horario[] = []; // Changed to Object array
  
  // Rangos de disponibilidad del entrenador para el día seleccionado
  rangosDelDia: RangoDisponibilidad[] = [];
  horasInicio: string[] = [];  // Horas de inicio disponibles
  horasFin: string[] = [];     // Horas de fin disponibles (filtradas según hora inicio)
  capacidadMaxima = 1;         // Capacidad máxima para el rango seleccionado
  tipoSesionPermitida: 'individual' | 'grupal' | 'ambos' = 'ambos';

  modalidades = [
    { value: 'presencial', label: 'Presencial', icono: 'people-outline', desc: 'Entrenamiento en persona' },
    { value: 'online', label: 'En línea', icono: 'monitor-outline', desc: 'Entrenamiento por videollamada' }
  ];

  // Mapeo de días de la semana (0=Domingo, 1=Lunes, etc.)
  private diasSemana: { [key: number]: string } = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado'
  };

  enviando = false;
  reservaConfirmada = false;
  numeroReserva = '';
  pagoCompletado = false;
  procesandoPago = false;
  cargandoHorarios = false;

  // ========== NUEVO: Sistema de reservas múltiples/recurrentes ==========
  tipoReserva: 'unica' | 'multiple' = 'unica';
  modoMultiple: 'calendario' | 'plan' = 'calendario';
  sesionesSeleccionadas: SesionSeleccionada[] = [];
  
  // Calendario visual para múltiples sesiones
  calendarioMes: DiaCalendario[][] = [];
  mesActual: Date = new Date();
  diasConDisponibilidad: Set<string> = new Set(); // formato 'YYYY-MM-DD'
  
  // Calendario visual para sesión única
  calendarioUnica: DiaCalendario[][] = [];
  mesActualUnica: Date = new Date();
  
  // Plan semanal (unificado)
  planRecurrente = {
    duracionMeses: 1 as 1 | 2 | 3,
    diaSemana: '' as string, // Legacy, ya no se usa
    horaInicio: '',
    horaFin: ''
  };
  diasSemanaPlan: string[] = []; // Array para múltiple selección de días
  fechasRecurrentes: string[] = []; // Fechas calculadas del plan
  
  // Opciones de días de semana con disponibilidad del entrenador
  diasSemanaOpciones: { key: string; label: string; disponible: boolean }[] = [];
  
  // Horas disponibles para modo múltiple (basadas en entrenador)
  horasDisponiblesMultiple: string[] = [];
  horasFinDisponiblesMultiple: string[] = [];
  horasDisponiblesPlan: string[] = [];
  horasFinDisponiblesPlan: string[] = [];
  
  // Horario para sesiones múltiples (se usa para todas las fechas seleccionadas)
  horarioMultiple = {
    horaInicio: '',
    horaFin: ''
  };
  
  // Modal de selección de horario por día
  diaSeleccionandoHorario: DiaCalendario | null = null;
  horarioTemporal = { horaInicio: '', horaFin: '' };
  horasDisponiblesDia: string[] = [];
  horasFinDisponiblesDia: string[] = [];
  rangosDisponiblesDia: { inicio: string; fin: string }[] = [];
  
  // Sistema de mensajes de feedback
  mensajeFeedback: { texto: string; tipo: 'success' | 'warning' | 'error' | 'info' } | null = null;
  private feedbackTimeout: any = null;
  // =====================================================================

  // Variables para OXXO (Stripe real)
  voucherOxxo: {
    referencia: string;
    monto: number;
    fechaExpiracion: Date;
    codigoBarras: string;
    hostedVoucherUrl?: string; // URL del voucher de Stripe
  } | null = null;
  mostrarVoucherOxxo = false;

  // Variables para Stripe
  paymentIntentId: string | null = null;
  stripeError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private clienteFirebase: ClienteFirebaseService,
    private stripeService: StripeService,
    private authFirebase: AuthFirebaseService,
    private afAuth: AngularFireAuth
  ) {
    this.fechaMinima = new Date().toISOString().split('T')[0];

    this.paso1Form = this.fb.group({
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      cantidadPersonas: [1, [Validators.required, Validators.min(1)]]
    });

    this.paso2Form = this.fb.group({
      modalidad: ['presencial'], // Siempre presencial
      notas: ['']
    });

    this.paso3Form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    });

    this.paso4Form = this.fb.group({
      metodoPago: ['tarjeta', Validators.required],
      // Campos para tarjeta
      numeroTarjeta: [''],
      nombreTitular: [''],
      fechaExpiracion: [''],
      cvv: [''],
      // OXXO usa el email del paso 3
      aceptaPoliticas: [false, Validators.requiredTrue]
    });

    // Actualizar validaciones según método de pago seleccionado
    this.paso4Form.get('metodoPago')?.valueChanges.subscribe(metodo => {
      this.actualizarValidacionesPago(metodo);
    });
    // Inicializar validaciones para tarjeta
    this.actualizarValidacionesPago('tarjeta');
  }

  // Variables para cupos
  cuposTotales = 10;
  cuposDisponibles = 10;

  ngOnInit() {
    this.isLoggedIn = false;
    const authSub = this.afAuth.authState.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    this.subscriptions.push(authSub);
    // 1. Obtener ID del entrenador de la URL y cargar desde Firebase
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarEntrenador(id);
    } else {
      this.cargandoEntrenador = false;
    }

    // Listener para cuando cambia la fecha
    this.paso1Form.get('fecha')?.valueChanges.subscribe((fecha) => {
      // Limpiar selecciones de hora cuando cambia la fecha
      this.paso1Form.patchValue({ horaInicio: '', horaFin: '' });
      this.horasFin = [];
      
      if (fecha) {
        // Cargar rangos de disponibilidad para el día seleccionado
        this.cargarRangosDelDia(fecha);
        
        // Luego cargar horarios ocupados si tenemos entrenador
        if (this.entrenador?.id) {
          this.cargarHorariosOcupados(this.entrenador.id, new Date(fecha));
        }
      } else {
        this.rangosDelDia = [];
        this.horasInicio = [];
      }
      this.validarCupos();
    });

    // Listener para cuando cambia la hora de inicio
    this.paso1Form.get('horaInicio')?.valueChanges.subscribe((horaInicio) => {
      this.paso1Form.patchValue({ horaFin: '' });
      
      if (horaInicio) {
        this.actualizarHorasFin(horaInicio);
      } else {
        this.horasFin = [];
        this.capacidadMaxima = 1;
      }
    });

    // Listener para cuando cambia la hora de fin
    this.paso1Form.get('horaFin')?.valueChanges.subscribe((horaFin) => {
      if (horaFin) {
        this.actualizarCapacidadYTipo();
      }
    });

    this.paso1Form.get('cantidadPersonas')?.valueChanges.subscribe(() => {
      this.validarCupos();
    });

    // Listener para mostrar campo de ubicación si es presencial
    this.paso2Form.get('modalidad')?.valueChanges.subscribe((modalidad) => {
      const ubicacionControl = this.paso2Form.get('ubicacion');
      if (modalidad === 'presencial') {
        ubicacionControl?.setValidators([Validators.required]);
      } else {
        ubicacionControl?.clearValidators();
      }
      ubicacionControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
  }

  /**
   * Cargar datos del entrenador desde Firebase
   */
  cargarEntrenador(id: string) {
    this.cargandoEntrenador = true;
    const sub = this.clienteFirebase.getEntrenador(id).subscribe({
      next: (entrenador) => {
        if (entrenador) {
          this.entrenador = entrenador;
          // Inicializar calendario para sesión única con disponibilidad del entrenador
          this.cargarDiasConDisponibilidad();
          this.generarCalendarioUnica();
        } else {
          // Entrenador no encontrado
          console.warn('Entrenador no encontrado con ID:', id);
          this.entrenador = null;
        }
        this.cargandoEntrenador = false;
      },
      error: (error) => {
        console.error('Error al cargar entrenador:', error);
        this.cargandoEntrenador = false;
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Cargar horarios ocupados desde Firebase para la fecha seleccionada
   */
  cargarHorariosOcupados(entrenadorId: string, fecha: Date) {
    this.cargandoHorarios = true;
    const sub = this.clienteFirebase.getHorariosOcupados(entrenadorId, fecha).subscribe({
      next: (horariosOcupados) => {
        this.horariosOcupados = horariosOcupados;
        this.generarHorarios(); // Regenerar con los horarios ocupados reales
        this.cargarCuposReales(fecha);
        this.cargandoHorarios = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios ocupados:', error);
        this.horariosOcupados = [];
        this.generarHorarios();
        this.cargandoHorarios = false;
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Cargar cupos disponibles basados en reservas reales
   */
  cargarCuposReales(fecha: Date) {
    // Los cupos se calculan basados en la cantidad de horarios disponibles
    const horariosLibres = this.horariosDisponibles.filter(h => h.disponible).length;
    this.cuposDisponibles = horariosLibres;
    this.cuposTotales = this.horariosDisponibles.length;
    this.validarCupos();
  }

  cargarCupos(fecha: Date | null) {
    // Este método ahora usa datos reales de Firebase
    if (!fecha || !this.entrenador?.id) return;
    this.cargarHorariosOcupados(this.entrenador.id, new Date(fecha));
  }

  actualizarCuposReserva() {
    // Ya no usamos localStorage, los cupos se actualizan automáticamente
    // cuando se crea la reserva en Firebase
    const fecha = this.paso1Form.get('fecha')?.value;
    if (fecha && this.entrenador?.id) {
      this.cargarHorariosOcupados(this.entrenador.id, new Date(fecha));
    }
  }

  validarCupos() {
    const cantidad = this.paso1Form.get('cantidadPersonas')?.value || 1;
    if (cantidad > this.capacidadMaxima) {
      this.paso1Form.get('cantidadPersonas')?.setErrors({ excedeCupos: true });
    } else {
      this.paso1Form.get('cantidadPersonas')?.setErrors(null);
    }
  }

  /**
   * Carga los rangos de disponibilidad del entrenador para el día seleccionado
   */
  cargarRangosDelDia(fechaSeleccionada: string) {
    // Parsear fecha manualmente para evitar problemas de timezone
    const partes = fechaSeleccionada.split('-');
    const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    const diaSemana = fecha.getDay();
    const diaKey = this.diasSemana[diaSemana];
    
    console.log('Cargando rangos para:', fechaSeleccionada, '-> Día:', diaKey);

    // Si no hay entrenador, usar valores por defecto
    if (!this.entrenador?.disponibilidad) {
      this.cargarRangosPorDefecto();
      return;
    }

    // Obtener rangos del día
    const disponibilidadDia = this.entrenador.disponibilidad[diaKey];
    console.log('Disponibilidad del día:', disponibilidadDia);

    if (!disponibilidadDia || !Array.isArray(disponibilidadDia) || disponibilidadDia.length === 0) {
      // No hay disponibilidad para este día
      this.rangosDelDia = [];
      this.horasInicio = [];
      return;
    }

    // Guardar rangos del día
    this.rangosDelDia = disponibilidadDia.map((r: any) => ({
      inicio: r.inicio || '09:00',
      fin: r.fin || '18:00',
      capacidad: r.capacidad || 1,
      tipoSesion: r.tipoSesion || 'ambos'
    }));

    // Generar lista de horas de inicio disponibles (cada 30 min dentro de los rangos)
    this.generarHorasInicio();
  }

  /**
   * Genera la lista de horas de inicio disponibles basándose en los rangos del día
   */
  private generarHorasInicio() {
    const horas: string[] = [];
    
    this.rangosDelDia.forEach(rango => {
      const inicio = this.parseHora(rango.inicio);
      const fin = this.parseHora(rango.fin);
      
      // Generar horas cada 30 minutos, dejando al menos 30 min antes del fin del rango
      for (let minutos = inicio; minutos < fin - 30; minutos += 30) {
        const horaStr = this.formatearHora(minutos);
        // Verificar si no está ocupado
        if (!this.horariosOcupados.includes(horaStr) && !horas.includes(horaStr)) {
          horas.push(horaStr);
        }
      }
    });

    // Ordenar horas
    horas.sort((a, b) => this.parseHora(a) - this.parseHora(b));
    this.horasInicio = horas;
  }

  /**
   * Actualiza las opciones de hora fin basándose en la hora de inicio seleccionada
   */
  actualizarHorasFin(horaInicioSeleccionada: string) {
    const horas: string[] = [];
    const inicioMin = this.parseHora(horaInicioSeleccionada);

    // Encontrar el rango que contiene esta hora de inicio
    const rangoActivo = this.rangosDelDia.find(rango => {
      const rangoInicio = this.parseHora(rango.inicio);
      const rangoFin = this.parseHora(rango.fin);
      return inicioMin >= rangoInicio && inicioMin < rangoFin;
    });

    if (!rangoActivo) {
      this.horasFin = [];
      return;
    }

    const rangoFinMin = this.parseHora(rangoActivo.fin);

    // Generar horas de fin posibles (mínimo 30 min después del inicio, hasta el fin del rango)
    for (let minutos = inicioMin + 30; minutos <= rangoFinMin; minutos += 30) {
      const horaStr = this.formatearHora(minutos);
      horas.push(horaStr);
    }

    this.horasFin = horas;
    
    // Actualizar capacidad y tipo basándose en el rango
    this.capacidadMaxima = rangoActivo.capacidad;
    this.tipoSesionPermitida = rangoActivo.tipoSesion;
    
    // Validar cantidad de personas
    const cantidadActual = this.paso1Form.get('cantidadPersonas')?.value || 1;
    if (cantidadActual > this.capacidadMaxima) {
      this.paso1Form.patchValue({ cantidadPersonas: this.capacidadMaxima });
    }
  }

  /**
   * Actualiza la capacidad máxima y tipo de sesión basándose en el rango seleccionado
   */
  actualizarCapacidadYTipo() {
    const horaInicio = this.paso1Form.get('horaInicio')?.value;
    if (!horaInicio) return;

    const inicioMin = this.parseHora(horaInicio);
    const rangoActivo = this.rangosDelDia.find(rango => {
      const rangoInicio = this.parseHora(rango.inicio);
      const rangoFin = this.parseHora(rango.fin);
      return inicioMin >= rangoInicio && inicioMin < rangoFin;
    });

    if (rangoActivo) {
      this.capacidadMaxima = rangoActivo.capacidad;
      this.tipoSesionPermitida = rangoActivo.tipoSesion;
    }
    
    this.validarCupos();
  }

  /**
   * Carga rangos por defecto cuando el entrenador no tiene disponibilidad configurada
   */
  private cargarRangosPorDefecto() {
    // Rango por defecto: 9am-7pm, capacidad 5, cualquier tipo
    this.rangosDelDia = [{
      inicio: '09:00',
      fin: '19:00',
      capacidad: 5,
      tipoSesion: 'ambos'
    }];
    this.generarHorasInicio();
  }

  /**
   * Mantener para compatibilidad - ahora usa el nuevo sistema
   */
  generarHorarios() {
    const fechaSeleccionada = this.paso1Form.get('fecha')?.value;
    if (fechaSeleccionada) {
      this.cargarRangosDelDia(fechaSeleccionada);
    }
  }

  /**
   * Convierte una hora en formato "HH:MM" a minutos desde medianoche
   */
  private parseHora(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  /**
   * Convierte minutos desde medianoche a formato "HH:MM"
   */
  private formatearHora(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Calcula la duración de la sesión en minutos
   */
  getDuracionSesion(): number {
    const horaInicio = this.paso1Form.get('horaInicio')?.value;
    const horaFin = this.paso1Form.get('horaFin')?.value;
    
    if (!horaInicio || !horaFin) return 0;
    
    return this.parseHora(horaFin) - this.parseHora(horaInicio);
  }

  /**
   * Formatea la duración para mostrar al usuario
   */
  getDuracionFormateada(): string {
    const minutos = this.getDuracionSesion();
    if (minutos === 0) return '';
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas === 0) return `${mins} minutos`;
    if (mins === 0) return horas === 1 ? '1 hora' : `${horas} horas`;
    return `${horas}h ${mins}min`;
  }

  siguiente() {
    if (this.validarPasoActual()) {
      this.pasos[this.pasoActual - 1].completado = true;
      this.pasoActual++;
    }
  }

  anterior() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  irAPaso(numero: number) {
    if (numero < this.pasoActual) {
      this.pasoActual = numero;
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual) {
      case 1:
        return this.validarPaso1Multiple();
      case 2:
        return this.paso2Form.valid;
      case 3:
        return this.isLoggedIn && this.paso3Form.valid;
      case 4:
        return this.paso4Form.valid;
      default:
        return true;
    }
  }

  irALogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: {
        returnUrl: this.router.url,
        rol: 'CLIENTE'
      }
    });
  }

  /**
   * Actualizar validaciones del formulario según el método de pago seleccionado
   */
  actualizarValidacionesPago(metodo: string) {
    const tarjetaControls = ['numeroTarjeta', 'nombreTitular', 'fechaExpiracion', 'cvv'];

    if (metodo === 'tarjeta') {
      // Activar validaciones de tarjeta
      this.paso4Form.get('numeroTarjeta')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      this.paso4Form.get('nombreTitular')?.setValidators([Validators.required]);
      this.paso4Form.get('fechaExpiracion')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      this.paso4Form.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else if (metodo === 'oxxo') {
      // Desactivar validaciones de tarjeta (OXXO usa email del paso 3)
      tarjetaControls.forEach(control => {
        this.paso4Form.get(control)?.clearValidators();
        this.paso4Form.get(control)?.setValue('');
      });
    }

    // Actualizar validez de todos los controles
    tarjetaControls.forEach(control => {
      this.paso4Form.get(control)?.updateValueAndValidity();
    });
  }

  /**
   * Generar referencia de pago OXXO (fallback si Stripe falla)
   */
  generarReferenciaOxxo(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + random;
  }

  procesarPago() {
    if (!this.paso4Form.valid) {
      alert('Por favor completa todos los datos de pago');
      return;
    }

    const metodoPago = this.paso4Form.get('metodoPago')?.value;
    this.procesandoPago = true;
    this.stripeError = null;

    if (metodoPago === 'oxxo') {
      this.procesarPagoOxxo();
    } else {
      this.procesarPagoTarjeta();
    }
  }

  /**
   * Procesar pago con OXXO
   * Si simulatedMode=true, genera voucher simulado sin llamar al backend
   */
  procesarPagoOxxo() {
    // Calcular precio según tipo de reserva
    const precioFinal = this.tipoReserva === 'unica' 
      ? (this.calcularPrecioTotal() || this.entrenador?.precio || 350)
      : this.calcularPrecioTotalMultiple();
    const email = this.paso3Form.get('email')?.value; // Usar email del paso 3
    const nombre = this.paso3Form.get('nombre')?.value;

    // Validar límite de OXXO ($10,000 MXN máximo)
    if (precioFinal > 10000) {
      this.procesandoPago = false;
      this.stripeError = `El monto de $${precioFinal.toLocaleString('es-MX')} MXN excede el límite de OXXO ($10,000 MXN). Por favor usa tarjeta o reduce la duración/personas.`;
      alert(this.stripeError);
      return;
    }

    // Modo simulado: genera voucher fake sin llamar a Stripe
    if (environment.stripe?.simulatedMode) {
      console.log('Modo simulado: generando voucher OXXO fake');
      
      // Simular delay de procesamiento
      setTimeout(() => {
        this.procesandoPago = false;
        
        // Generar voucher simulado
        const referenciaSimulada = this.generarReferenciaSimulada();
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 3); // 3 días para pagar
        
        this.voucherOxxo = {
          referencia: referenciaSimulada,
          monto: precioFinal,
          fechaExpiracion: fechaExpiracion,
          codigoBarras: referenciaSimulada,
          hostedVoucherUrl: undefined
        };
        
        this.paymentIntentId = 'pi_simulated_' + Date.now();
        // Ir directo a confirmación (el popup de Stripe ya se mostró)
        this.confirmarPagoOxxo();
        console.log('Voucher OXXO simulado generado:', this.voucherOxxo);
      }, 1500);
      
      return;
    }

    // Modo real: usar Stripe
    const montoEnCentavos = Math.round(precioFinal * 100);
    
    console.log('=== DEBUG PAGO OXXO ===');
    console.log('precioFinal (pesos):', precioFinal);
    console.log('montoEnCentavos:', montoEnCentavos);
    console.log('Entrenador precio:', this.entrenador?.precio);
    console.log('Duración minutos:', this.getDuracionSesion());
    console.log('Personas:', this.paso1Form.get('cantidadPersonas')?.value);

    // 1. Crear PaymentIntent en el backend
    this.stripeService.createOxxoPaymentIntent({
      amount: montoEnCentavos,
      currency: 'mxn',
      customerEmail: email,
      customerName: nombre,
      description: `Reserva con ${this.entrenador?.nombre} - ${this.paso1Form.get('fecha')?.value}`,
      metadata: {
        entrenadorId: this.entrenador?.id || '',
        fecha: this.paso1Form.get('fecha')?.value,
        hora: `${this.paso1Form.get('horaInicio')?.value} - ${this.paso1Form.get('horaFin')?.value}`,
      }
    }).subscribe({
      next: async (response) => {
        this.paymentIntentId = response.paymentIntentId;
        
        // 2. Confirmar el pago OXXO (genera el voucher)
        const result = await this.stripeService.confirmOxxoPayment(
          response.clientSecret,
          {
            name: nombre,
            email: email
          }
        );

        this.procesandoPago = false;

        if (result.success && result.oxxoVoucher) {
          // Voucher generado exitosamente por Stripe
          this.voucherOxxo = {
            referencia: result.oxxoVoucher.number || this.generarReferenciaSimulada(),
            monto: precioFinal,
            fechaExpiracion: result.oxxoVoucher.expiresAt,
            codigoBarras: result.oxxoVoucher.number || this.generarReferenciaSimulada(),
            hostedVoucherUrl: result.oxxoVoucher.hostedVoucherUrl
          };
          // Ir directo a confirmación (el popup de Stripe ya se mostró)
          this.confirmarPagoOxxo();
          console.log('Voucher OXXO generado:', this.voucherOxxo);

          // Enviar email con instrucciones de OXXO
          this.stripeService.sendOxxoEmail({
            customerEmail: email,
            customerName: nombre,
            amount: Math.round(precioFinal * 100), // En centavos
            oxxoNumber: this.voucherOxxo.referencia,
            expiresAt: Math.floor(this.voucherOxxo.fechaExpiracion.getTime() / 1000),
            entrenadorNombre: this.entrenador?.nombre || '',
            fecha: this.paso1Form.get('fecha')?.value,
            hora: `${this.paso1Form.get('horaInicio')?.value} - ${this.paso1Form.get('horaFin')?.value}`,
            hostedVoucherUrl: result.oxxoVoucher.hostedVoucherUrl || ''
          }).subscribe({
            next: () => console.log('✅ Email de OXXO enviado exitosamente'),
            error: (err) => console.warn('⚠️ No se pudo enviar email de OXXO:', err)
          });
        } else {
          // Error al confirmar
          this.stripeError = result.error || 'Error al generar el voucher OXXO';
          alert('Error: ' + this.stripeError);
        }
      },
      error: (error) => {
        this.procesandoPago = false;
        this.stripeError = error.message || 'Error al procesar el pago';
        alert('Error al crear el pago: ' + this.stripeError);
        console.error('Error creating OXXO payment:', error);
      }
    });
  }

  /**
   * Confirmar pago OXXO y crear reserva pendiente
   */
  confirmarPagoOxxo() {
    this.pagoCompletado = true;
    this.pasos[3].completado = true;
    this.mostrarVoucherOxxo = false;
    this.pasoActual = 5;
  }

  /**
   * Procesar pago con tarjeta usando Stripe real
   */
  procesarPagoTarjeta() {
    // Calcular precio según tipo de reserva
    const precioFinal = this.tipoReserva === 'unica' 
      ? this.calcularPrecioTotal()
      : this.calcularPrecioTotalMultiple();
    const montoEnCentavos = Math.round(precioFinal * 100);
    const email = this.paso3Form.get('email')?.value;
    const nombre = this.paso3Form.get('nombre')?.value;

    // Para tarjeta, usamos el flujo simplificado (sin Stripe Elements por ahora)
    // En producción real, deberías usar Stripe Elements para mayor seguridad
    this.stripeService.createCardPaymentIntent({
      amount: montoEnCentavos,
      currency: 'mxn',
      customerEmail: email,
      customerName: nombre,
      description: `Reserva con ${this.entrenador?.nombre} - ${this.paso1Form.get('fecha')?.value}`,
      metadata: {
        entrenadorId: this.entrenador?.id || '',
        fecha: this.paso1Form.get('fecha')?.value,
        hora: `${this.paso1Form.get('horaInicio')?.value} - ${this.paso1Form.get('horaFin')?.value}`,
      }
    }).subscribe({
      next: (response) => {
        this.paymentIntentId = response.clientSecret.split('_secret_')[0];
        
        // NOTA: Para producción real, aquí deberías usar Stripe Elements
        // para capturar los datos de la tarjeta de forma segura.
        // Por ahora, simulamos el éxito del pago.
        
        console.log('PaymentIntent creado:', this.paymentIntentId);
        
        // Simular confirmación exitosa (en producción usar stripe.confirmCardPayment)
        setTimeout(() => {
          this.procesandoPago = false;
          this.pagoCompletado = true;
          this.pasos[3].completado = true;
          this.pasoActual = 5;
        }, 1500);
      },
      error: (error) => {
        this.procesandoPago = false;
        this.stripeError = error.message || 'Error al procesar el pago';
        alert('Error al crear el pago: ' + this.stripeError);
        console.error('Error creating card payment:', error);
      }
    });
  }

  confirmarReserva() {
    if (!this.pagoCompletado) {
      alert('Por favor completa el pago primero');
      return;
    }

    if (!this.entrenador?.id) {
      alert('Error: No se encontró información del entrenador');
      return;
    }

    this.enviando = true;

    // Manejar según tipo de reserva
    if (this.tipoReserva === 'unica') {
      this.crearReservaUnica();
    } else {
      this.crearReservasMultiples();
    }
  }

  /**
   * Crear una sola reserva (flujo original)
   */
  private crearReservaUnica() {
    const fechaReserva = new Date(this.paso1Form.get('fecha')?.value);
    const horaInicio = this.paso1Form.get('horaInicio')?.value;
    const horaFin = this.paso1Form.get('horaFin')?.value;

    // Combinar fecha y hora de inicio
    const [horas, minutos] = horaInicio.split(':').map(Number);
    fechaReserva.setHours(horas, minutos, 0, 0);

    const reservaData: Omit<Reserva, 'id' | 'clienteId' | 'fechaCreacion'> = {
      entrenadorId: this.entrenador!.id!,
      entrenadorNombre: this.entrenador!.nombre + ' ' + (this.entrenador!.apellidoPaterno || ''),
      clienteNombre: this.paso3Form.get('nombre')?.value,
      fecha: fechaReserva,
      hora: horaInicio,
      horaFin: horaFin,
      duracion: this.getDuracionSesion(),
      precio: this.calcularPrecioTotal(),
      modalidad: this.paso2Form.get('modalidad')?.value,
      estado: this.pagoCompletado ? 'CONFIRMADA' : 'PENDIENTE',
      notas: this.paso2Form.get('notas')?.value || '',
      ubicacion: this.paso2Form.get('ubicacion')?.value || ''
    };

    this.clienteFirebase.crearReserva(reservaData).then(result => {
      this.enviando = false;

      if (result.success) {
        this.reservaConfirmada = true;
        this.numeroReserva = 'RSV-' + (result.id?.substring(0, 8).toUpperCase() || Math.random().toString(36).substr(2, 9).toUpperCase());
        console.log('Reserva creada exitosamente:', result.id);
      } else {
        alert('Error al crear la reserva: ' + result.message);
      }
    }).catch(error => {
      this.enviando = false;
      console.error('Error al confirmar reserva:', error);
      alert('Error al crear la reserva. Por favor intenta de nuevo.');
    });
  }

  /**
   * Crear múltiples reservas (para modo multiple y recurrente)
   */
  private async crearReservasMultiples() {
    const sesiones = this.tipoReserva === 'multiple' 
      ? this.sesionesSeleccionadas 
      : this.fechasRecurrentes.map(fecha => ({
          fecha: fecha,
          horaInicio: this.planRecurrente.horaInicio,
          horaFin: this.planRecurrente.horaFin
        }));

    const precioUnitario = this.calcularPrecioTotalMultiple() / sesiones.length;
    const reservasCreadas: string[] = [];
    const errores: string[] = [];

    for (const sesion of sesiones) {
      const fechaReserva = new Date(sesion.fecha);
      const [horas, minutos] = sesion.horaInicio.split(':').map(Number);
      fechaReserva.setHours(horas, minutos, 0, 0);

      const reservaData: Omit<Reserva, 'id' | 'clienteId' | 'fechaCreacion'> = {
        entrenadorId: this.entrenador!.id!,
        entrenadorNombre: this.entrenador!.nombre + ' ' + (this.entrenador!.apellidoPaterno || ''),
        clienteNombre: this.paso3Form.get('nombre')?.value,
        fecha: fechaReserva,
        hora: sesion.horaInicio,
        horaFin: sesion.horaFin,
        duracion: this.getDuracionSesion(),
        precio: precioUnitario,
        modalidad: this.paso2Form.get('modalidad')?.value,
        estado: this.pagoCompletado ? 'CONFIRMADA' : 'PENDIENTE',
        notas: `${this.paso2Form.get('notas')?.value || ''} [${this.tipoReserva === 'multiple' ? 'Sesión múltiple' : 'Plan recurrente'} - ${reservasCreadas.length + 1}/${sesiones.length}]`.trim(),
        ubicacion: this.paso2Form.get('ubicacion')?.value || ''
      };

      try {
        const result = await this.clienteFirebase.crearReserva(reservaData);
        if (result.success && result.id) {
          reservasCreadas.push(result.id);
        } else {
          errores.push(`Error en sesión del ${sesion.fecha}: ${result.message}`);
        }
      } catch (error) {
        console.error('Error al crear reserva:', error);
        errores.push(`Error en sesión del ${sesion.fecha}`);
      }
    }

    this.enviando = false;

    if (reservasCreadas.length > 0) {
      this.reservaConfirmada = true;
      this.numeroReserva = 'RSV-' + reservasCreadas[0].substring(0, 8).toUpperCase() + ` (+${reservasCreadas.length - 1} más)`;
      console.log(`${reservasCreadas.length} reservas creadas exitosamente`);
      
      if (errores.length > 0) {
        console.warn('Algunas reservas fallaron:', errores);
      }
    } else {
      alert('No se pudo crear ninguna reserva. Por favor intenta de nuevo.');
    }
  }

  calcularPrecioTotal(): number {
    const duracionMinutos = this.getDuracionSesion() || 60;
    const modalidad = this.paso2Form.get('modalidad')?.value;
    // Usar precio online si la modalidad es online
    const precioHora = modalidad === 'online' 
      ? (this.entrenador?.precioOnline || this.entrenador?.precio || 0)
      : (this.entrenador?.precio || 0);
    const personas = this.paso1Form.get('cantidadPersonas')?.value || 1;
    return ((duracionMinutos / 60) * precioHora) * personas;
  }

  // ==================== MÉTODOS PARA RESERVAS MÚLTIPLES/RECURRENTES ====================

  /**
   * Cambiar tipo de reserva y resetear selecciones
   */
  cambiarTipoReserva(tipo: 'unica' | 'multiple') {
    this.tipoReserva = tipo;
    this.sesionesSeleccionadas = [];
    this.fechasRecurrentes = [];
    this.horarioMultiple = { horaInicio: '', horaFin: '' };
    this.planRecurrente = { duracionMeses: 1, diaSemana: '', horaInicio: '', horaFin: '' };
    this.diasSemanaPlan = [];
    this.modoMultiple = 'calendario';
    
    // Cargar disponibilidad del entrenador
    this.cargarDiasConDisponibilidad();
    
    if (tipo === 'unica') {
      this.paso1Form.patchValue({ fecha: '', horaInicio: '', horaFin: '' });
      this.generarCalendarioUnica();
    } else {
      // Para múltiple, generar calendario y cargar opciones
      this.cargarHorasDisponiblesMultiple();
      this.cargarDiasSemanaOpciones();
    }
  }

  // ==================== MÉTODOS PARA CALENDARIO SESIÓN ÚNICA ====================

  /**
   * Generar calendario para sesión única
   */
  generarCalendarioUnica() {
    const año = this.mesActualUnica.getFullYear();
    const mes = this.mesActualUnica.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const primerDiaSemana = primerDia.getDay();
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaSeleccionada = this.paso1Form.get('fecha')?.value;
    
    const semanas: DiaCalendario[][] = [];
    let semanaActual: DiaCalendario[] = [];
    
    // Días del mes anterior
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(año, mes - 1, diasMesAnterior - i);
      semanaActual.push({
        fecha,
        dia: fecha.getDate(),
        disponible: false,
        seleccionado: false,
        esMesActual: false,
        esHoy: false
      });
    }
    
    // Días del mes actual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(año, mes, d);
      const fechaStr = this.formatearFechaISO(fecha);
      const esPasado = fecha < hoy;
      const tieneDisponibilidad = this.diasConDisponibilidad.has(fechaStr);
      
      semanaActual.push({
        fecha,
        dia: d,
        disponible: !esPasado && tieneDisponibilidad,
        seleccionado: fechaSeleccionada === fechaStr,
        esMesActual: true,
        esHoy: fecha.getTime() === hoy.getTime()
      });
      
      if (semanaActual.length === 7) {
        semanas.push(semanaActual);
        semanaActual = [];
      }
    }
    
    // Completar última semana
    let diaNextMes = 1;
    while (semanaActual.length < 7 && semanaActual.length > 0) {
      const fecha = new Date(año, mes + 1, diaNextMes);
      semanaActual.push({
        fecha,
        dia: diaNextMes,
        disponible: false,
        seleccionado: false,
        esMesActual: false,
        esHoy: false
      });
      diaNextMes++;
    }
    if (semanaActual.length > 0) {
      semanas.push(semanaActual);
    }
    
    this.calendarioUnica = semanas;
  }

  /**
   * Mostrar mensaje de feedback temporal
   */
  mostrarFeedback(texto: string, tipo: 'success' | 'warning' | 'error' | 'info', duracion: number = 3000) {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
    
    this.mensajeFeedback = { texto, tipo };
    
    this.feedbackTimeout = setTimeout(() => {
      this.mensajeFeedback = null;
    }, duracion);
  }

  /**
   * Seleccionar un día en sesión única
   */
  seleccionarDiaUnico(dia: DiaCalendario) {
    if (!dia.esMesActual) {
      return;
    }
    
    if (!dia.disponible) {
      this.mostrarFeedback('Este día no tiene disponibilidad. El entrenador no trabaja este día.', 'warning');
      return;
    }
    
    const fechaStr = this.formatearFechaISO(dia.fecha);
    
    // Deseleccionar todos los días
    this.calendarioUnica.forEach(semana => {
      semana.forEach(d => d.seleccionado = false);
    });
    
    // Seleccionar este día
    dia.seleccionado = true;
    
    // Mostrar confirmación
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDia = diasSemana[dia.fecha.getDay()];
    this.mostrarFeedback(`${nombreDia} ${dia.fecha.getDate()} seleccionado. Ahora elige el horario.`, 'success');
    
    // Actualizar el form con la fecha
    this.paso1Form.patchValue({ fecha: fechaStr, horaInicio: '', horaFin: '' });
    
    // Cargar horarios disponibles para este día
    if (this.entrenador?.id) {
      this.cargarHorariosOcupados(this.entrenador.id, dia.fecha);
    }
  }

  /**
   * Navegar mes en calendario de sesión única
   */
  cambiarMesUnica(delta: number) {
    this.mesActualUnica = new Date(this.mesActualUnica.getFullYear(), this.mesActualUnica.getMonth() + delta, 1);
    this.generarCalendarioUnica();
  }

  /**
   * Obtener nombre del mes para sesión única
   */
  getNombreMesUnica(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[this.mesActualUnica.getMonth()]} ${this.mesActualUnica.getFullYear()}`;
  }

  // ==================== MÉTODOS PARA MÚLTIPLES SESIONES ====================

  /**
   * Cambiar modo dentro de múltiples sesiones
   */
  cambiarModoMultiple(modo: 'calendario' | 'plan') {
    this.modoMultiple = modo;
    this.sesionesSeleccionadas = [];
    this.fechasRecurrentes = [];
    this.horarioMultiple = { horaInicio: '', horaFin: '' };
    this.planRecurrente = { duracionMeses: 1, diaSemana: '', horaInicio: '', horaFin: '' };
    this.diasSemanaPlan = [];
    
    if (modo === 'calendario') {
      this.generarCalendario();
    }
  }

  /**
   * Cargar opciones de días de la semana con disponibilidad del entrenador
   */
  cargarDiasSemanaOpciones() {
    const dias = [
      { key: 'lunes', label: 'Lun' },
      { key: 'martes', label: 'Mar' },
      { key: 'miercoles', label: 'Mié' },
      { key: 'jueves', label: 'Jue' },
      { key: 'viernes', label: 'Vie' },
      { key: 'sabado', label: 'Sáb' },
      { key: 'domingo', label: 'Dom' }
    ];
    
    this.diasSemanaOpciones = dias.map(dia => {
      const disponibilidadDia = this.entrenador?.disponibilidad?.[dia.key];
      const disponible = disponibilidadDia && Array.isArray(disponibilidadDia) && disponibilidadDia.length > 0;
      return { ...dia, disponible };
    });
  }

  /**
   * Cargar horas disponibles del entrenador para modo múltiple
   */
  cargarHorasDisponiblesMultiple() {
    const todasHoras = new Set<string>();
    
    if (this.entrenador?.disponibilidad) {
      Object.values(this.entrenador.disponibilidad).forEach((rangos: any) => {
        if (Array.isArray(rangos)) {
          rangos.forEach((rango: any) => {
            if (rango.inicio && rango.fin) {
              // Agregar cada hora posible en el rango
              const horaInicio = parseInt(rango.inicio.split(':')[0]);
              const horaFin = parseInt(rango.fin.split(':')[0]);
              for (let h = horaInicio; h <= horaFin; h++) {
                todasHoras.add(`${h.toString().padStart(2, '0')}:00`);
              }
            }
          });
        }
      });
    }
    
    const horasArray = Array.from(todasHoras).sort();
    this.horasDisponiblesMultiple = horasArray.slice(0, -1); // Quitar última (no puede ser inicio)
    this.horasFinDisponiblesMultiple = horasArray.slice(1);   // Quitar primera (no puede ser fin)
    
    this.horasDisponiblesPlan = [...this.horasDisponiblesMultiple];
    this.horasFinDisponiblesPlan = [...this.horasFinDisponiblesMultiple];
  }

  /**
   * Toggle día de semana en plan semanal (múltiple selección)
   */
  toggleDiaSemana(dia: string) {
    const index = this.diasSemanaPlan.indexOf(dia);
    if (index >= 0) {
      this.diasSemanaPlan.splice(index, 1);
    } else {
      this.diasSemanaPlan.push(dia);
    }
    this.calcularFechasRecurrentes();
  }

  /**
   * Establecer duración del plan
   */
  setPlanDuracion(meses: 1 | 2 | 3) {
    this.planRecurrente.duracionMeses = meses;
    this.calcularFechasRecurrentes();
  }

  /**
   * Generar calendario del mes actual
   */
  generarCalendario() {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    // Día de la semana del primer día (0=Dom, 1=Lun, etc.)
    const primerDiaSemana = primerDia.getDay();
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const semanas: DiaCalendario[][] = [];
    let semanaActual: DiaCalendario[] = [];
    
    // Días del mes anterior para completar primera semana
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(año, mes - 1, diasMesAnterior - i);
      semanaActual.push({
        fecha,
        dia: fecha.getDate(),
        disponible: false,
        seleccionado: false,
        esMesActual: false,
        esHoy: false
      });
    }
    
    // Días del mes actual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(año, mes, d);
      const fechaStr = this.formatearFechaISO(fecha);
      const esPasado = fecha < hoy;
      const tieneDisponibilidad = this.diasConDisponibilidad.has(fechaStr);
      
      semanaActual.push({
        fecha,
        dia: d,
        disponible: !esPasado && tieneDisponibilidad,
        seleccionado: this.sesionesSeleccionadas.some(s => s.fecha === fechaStr),
        esMesActual: true,
        esHoy: fecha.getTime() === hoy.getTime()
      });
      
      if (semanaActual.length === 7) {
        semanas.push(semanaActual);
        semanaActual = [];
      }
    }
    
    // Completar última semana con días del siguiente mes
    let diaNextMes = 1;
    while (semanaActual.length < 7 && semanaActual.length > 0) {
      const fecha = new Date(año, mes + 1, diaNextMes);
      semanaActual.push({
        fecha,
        dia: diaNextMes,
        disponible: false,
        seleccionado: false,
        esMesActual: false,
        esHoy: false
      });
      diaNextMes++;
    }
    if (semanaActual.length > 0) {
      semanas.push(semanaActual);
    }
    
    this.calendarioMes = semanas;
  }

  /**
   * Cargar días que tienen disponibilidad del entrenador
   */
  cargarDiasConDisponibilidad() {
    this.diasConDisponibilidad.clear();
    
    console.log('=== DEBUG cargarDiasConDisponibilidad ===');
    console.log('Entrenador:', this.entrenador?.nombre);
    console.log('Disponibilidad objeto:', this.entrenador?.disponibilidad);
    
    if (!this.entrenador?.disponibilidad) {
      console.warn('No hay disponibilidad configurada para este entrenador');
      return;
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Verificar próximos 90 días
    for (let i = 0; i < 90; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      
      const diaSemana = fecha.getDay();
      const diaKey = this.diasSemana[diaSemana];
      
      const disponibilidadDia = this.entrenador.disponibilidad[diaKey];
      
      // Log solo para primeros 7 días para ver el patrón
      if (i < 7) {
        console.log(`Día ${i}: ${this.formatearFechaISO(fecha)} (${diaKey}) -> `, disponibilidadDia);
      }
      
      if (disponibilidadDia && Array.isArray(disponibilidadDia) && disponibilidadDia.length > 0) {
        this.diasConDisponibilidad.add(this.formatearFechaISO(fecha));
      }
    }
    
    console.log('Total días con disponibilidad:', this.diasConDisponibilidad.size);
    console.log('Días disponibles:', Array.from(this.diasConDisponibilidad).slice(0, 10));
    
    // Regenerar calendario con los días actualizados
    this.generarCalendario();
  }

  /**
   * Navegar mes anterior/siguiente
   */
  cambiarMes(delta: number) {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + delta, 1);
    this.generarCalendario();
  }

  /**
   * Toggle selección de día en modo múltiple (legacy - ya no se usa directamente)
   */
  toggleDiaSeleccionado(dia: DiaCalendario) {
    if (!dia.disponible || !dia.esMesActual) return;
    
    const fechaStr = this.formatearFechaISO(dia.fecha);
    const index = this.sesionesSeleccionadas.findIndex(s => s.fecha === fechaStr);
    
    if (index >= 0) {
      // Quitar selección
      this.sesionesSeleccionadas.splice(index, 1);
      dia.seleccionado = false;
    } else {
      // Agregar si tiene horario configurado
      if (this.horarioMultiple.horaInicio && this.horarioMultiple.horaFin) {
        this.sesionesSeleccionadas.push({
          fecha: fechaStr,
          horaInicio: this.horarioMultiple.horaInicio,
          horaFin: this.horarioMultiple.horaFin,
          duracionMinutos: this.parseHora(this.horarioMultiple.horaFin) - this.parseHora(this.horarioMultiple.horaInicio)
        });
        dia.seleccionado = true;
      } else {
        alert('Primero selecciona el horario que deseas para todas las sesiones');
      }
    }
  }

  /**
   * Abrir modal para seleccionar horario de un día específico
   */
  abrirSelectorHorario(dia: DiaCalendario) {
    if (!dia.esMesActual) {
      return;
    }
    
    if (!dia.disponible) {
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const nombreDia = diasSemana[dia.fecha.getDay()];
      this.mostrarFeedback(`El entrenador no tiene disponibilidad los ${nombreDia}. Selecciona otro día.`, 'warning');
      return;
    }
    
    const fechaStr = this.formatearFechaISO(dia.fecha);
    
    // Si ya está seleccionado, quitarlo
    const index = this.sesionesSeleccionadas.findIndex(s => s.fecha === fechaStr);
    if (index >= 0) {
      this.sesionesSeleccionadas.splice(index, 1);
      dia.seleccionado = false;
      this.mostrarFeedback(`Sesión del ${dia.fecha.getDate()}/${dia.fecha.getMonth() + 1} eliminada`, 'info');
      return;
    }
    
    // Cargar horarios disponibles para este día
    this.diaSeleccionandoHorario = dia;
    this.horarioTemporal = { horaInicio: '', horaFin: '' };
    this.cargarHorariosParaDia(dia.fecha);
  }

  /**
   * Cargar horarios disponibles del entrenador para un día específico
   */
  cargarHorariosParaDia(fecha: Date) {
    const diaSemana = fecha.getDay();
    const diaKey = this.diasSemana[diaSemana];
    
    const disponibilidadDia = this.entrenador?.disponibilidad?.[diaKey];
    this.rangosDisponiblesDia = [];
    this.horasDisponiblesDia = [];
    this.horasFinDisponiblesDia = [];
    
    if (disponibilidadDia && Array.isArray(disponibilidadDia)) {
      // Guardar rangos para mostrar
      this.rangosDisponiblesDia = disponibilidadDia.map((r: any) => ({
        inicio: r.inicio,
        fin: r.fin
      }));
      
      // Generar todas las horas posibles
      const todasHoras = new Set<string>();
      disponibilidadDia.forEach((rango: any) => {
        if (rango.inicio && rango.fin) {
          const horaInicio = parseInt(rango.inicio.split(':')[0]);
          const horaFin = parseInt(rango.fin.split(':')[0]);
          for (let h = horaInicio; h <= horaFin; h++) {
            todasHoras.add(`${h.toString().padStart(2, '0')}:00`);
          }
        }
      });
      
      const horasArray = Array.from(todasHoras).sort();
      this.horasDisponiblesDia = horasArray.slice(0, -1);
      this.horasFinDisponiblesDia = horasArray.slice(1);
    }
  }

  /**
   * Cerrar modal de selección de horario
   */
  cerrarSelectorHorario() {
    this.diaSeleccionandoHorario = null;
    this.horarioTemporal = { horaInicio: '', horaFin: '' };
  }

  /**
   * Confirmar y agregar sesión con horario seleccionado
   */
  confirmarSesionMultiple() {
    if (!this.diaSeleccionandoHorario || !this.horarioTemporal.horaInicio || !this.horarioTemporal.horaFin) {
      this.mostrarFeedback('Debes seleccionar hora de inicio y fin', 'warning');
      return;
    }
    
    const fechaStr = this.formatearFechaISO(this.diaSeleccionandoHorario.fecha);
    const duracion = this.parseHora(this.horarioTemporal.horaFin) - this.parseHora(this.horarioTemporal.horaInicio);
    
    this.sesionesSeleccionadas.push({
      fecha: fechaStr,
      horaInicio: this.horarioTemporal.horaInicio,
      horaFin: this.horarioTemporal.horaFin,
      duracionMinutos: duracion
    });
    
    this.diaSeleccionandoHorario.seleccionado = true;
    
    const dia = this.diaSeleccionandoHorario.fecha.getDate();
    const mes = this.diaSeleccionandoHorario.fecha.getMonth() + 1;
    this.mostrarFeedback(`¡Sesión del ${dia}/${mes} agregada! (${this.horarioTemporal.horaInicio} - ${this.horarioTemporal.horaFin})`, 'success');
    
    this.cerrarSelectorHorario();
    
    // Actualizar el calendario
    this.generarCalendario();
  }

  /**
   * Quitar una sesión de la lista
   */
  quitarSesion(index: number) {
    const sesion = this.sesionesSeleccionadas[index];
    this.sesionesSeleccionadas.splice(index, 1);
    
    // Mostrar mensaje de confirmación
    const fechaParts = sesion.fecha.split('-');
    this.mostrarFeedback(`Sesión del ${fechaParts[2]}/${fechaParts[1]} eliminada`, 'info');
    
    // Actualizar el calendario para deseleccionar el día
    this.calendarioMes.forEach(semana => {
      semana.forEach(dia => {
        if (this.formatearFechaISO(dia.fecha) === sesion.fecha) {
          dia.seleccionado = false;
        }
      });
    });
  }

  /**
   * Actualizar horario para todas las sesiones múltiples
   */
  actualizarHorarioMultiple() {
    if (!this.horarioMultiple.horaInicio || !this.horarioMultiple.horaFin) return;
    
    const duracion = this.parseHora(this.horarioMultiple.horaFin) - this.parseHora(this.horarioMultiple.horaInicio);
    
    this.sesionesSeleccionadas.forEach(sesion => {
      sesion.horaInicio = this.horarioMultiple.horaInicio;
      sesion.horaFin = this.horarioMultiple.horaFin;
      sesion.duracionMinutos = duracion;
    });
  }

  /**
   * Configurar plan recurrente y calcular fechas (soporta múltiples días)
   */
  calcularFechasRecurrentes() {
    // Usar diasSemanaPlan (array) en lugar de planRecurrente.diaSemana
    if (this.diasSemanaPlan.length === 0 || !this.planRecurrente.horaInicio || !this.planRecurrente.horaFin) {
      this.fechasRecurrentes = [];
      this.sesionesSeleccionadas = [];
      return;
    }
    
    const semanas = this.planRecurrente.duracionMeses * 4; // 4 semanas por mes aproximado
    const diaMap: { [key: string]: number } = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3,
      'jueves': 4, 'viernes': 5, 'sabado': 6
    };
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    this.fechasRecurrentes = [];
    this.sesionesSeleccionadas = [];
    
    const duracion = this.parseHora(this.planRecurrente.horaFin) - this.parseHora(this.planRecurrente.horaInicio);
    
    // Para cada día de la semana seleccionado
    for (const diaSemana of this.diasSemanaPlan) {
      const diaObjetivo = diaMap[diaSemana];
      
      // Encontrar el próximo día de este tipo
      let fechaInicio = new Date(hoy);
      while (fechaInicio.getDay() !== diaObjetivo) {
        fechaInicio.setDate(fechaInicio.getDate() + 1);
      }
      
      // Agregar todas las semanas
      for (let i = 0; i < semanas; i++) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fechaInicio.getDate() + (i * 7));
        
        const fechaStr = this.formatearFechaISO(fecha);
        this.fechasRecurrentes.push(fechaStr);
        
        this.sesionesSeleccionadas.push({
          fecha: fechaStr,
          horaInicio: this.planRecurrente.horaInicio,
          horaFin: this.planRecurrente.horaFin,
          duracionMinutos: duracion
        });
      }
    }
    
    // Ordenar fechas cronológicamente
    this.fechasRecurrentes.sort();
    this.sesionesSeleccionadas.sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    // Actualizar calendario para mostrar fechas seleccionadas
    this.generarCalendario();
  }

  /**
   * Obtener nombre del mes en español
   */
  getNombreMes(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[this.mesActual.getMonth()]} ${this.mesActual.getFullYear()}`;
  }

  /**
   * Formatear fecha a ISO (YYYY-MM-DD)
   */
  private formatearFechaISO(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  /**
   * Calcular precio total (sesión única o múltiples)
   */
  calcularPrecioTotalMultiple(): number {
    const precioHora = this.entrenador?.precio || 0;
    const personas = this.paso1Form.get('cantidadPersonas')?.value || 1;
    
    if (this.tipoReserva === 'unica') {
      return this.calcularPrecioTotal();
    }
    
    // Para múltiples sesiones
    let duracionTotalMinutos = 0;
    this.sesionesSeleccionadas.forEach(sesion => {
      duracionTotalMinutos += sesion.duracionMinutos;
    });
    
    return ((duracionTotalMinutos / 60) * precioHora) * personas;
  }

  /**
   * Obtener total de sesiones seleccionadas
   */
  getTotalSesiones(): number {
    if (this.tipoReserva === 'unica') return 1;
    return this.sesionesSeleccionadas.length;
  }

  /**
   * Validar paso 1 considerando tipo de reserva
   */
  validarPaso1Multiple(): boolean {
    if (this.tipoReserva === 'unica') {
      return this.paso1Form.valid;
    }
    
    // Para múltiple/recurrente, debe haber al menos una sesión
    return this.sesionesSeleccionadas.length > 0 && this.paso1Form.get('cantidadPersonas')?.valid === true;
  }

  // ===================================================================================

  cerrar() {
    if (this.reservaConfirmada) {
      this.router.navigate(['/']); // Volver a home o lista
    } else if (this.pasoActual > 1) {
      if (confirm('¿Seguro que deseas salir? Perderás los datos ingresados.')) {
        this.volverAPerfil();
      }
    } else {
      this.volverAPerfil();
    }
  }

  volverAPerfil() {
    if (this.entrenador && this.entrenador.id) {
      this.router.navigate(['/entrenador', this.entrenador.id]);
    } else {
      this.router.navigate(['/entrenadores']);
    }
  }

  formatearTarjeta(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(.{4})/g, '$1 ').trim();
    this.paso4Form.patchValue({ numeroTarjeta: value }, { emitEvent: false });
    if (event.target.value !== formatted) {
      event.target.value = formatted;
    }
  }

  formatearFechaExpiracion(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    let formatted = value;
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.paso4Form.patchValue({ fechaExpiracion: formatted }, { emitEvent: false });
    if (event.target.value !== formatted) {
      event.target.value = formatted;
    }
  }

  contactarWhatsApp() {
    const telefono = this.entrenador?.whatsapp || '529999999999';
    const mensaje = `Hola ${this.entrenador?.nombre}, me gustaría agendar una sesión.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  /**
   * Formatear referencia OXXO con espacios cada 4 dígitos
   */
  formatearReferencia(referencia: string): string {
    if (!referencia) return '';
    const limpio = referencia.replace(/\s/g, '');
    return limpio.match(/.{1,4}/g)?.join(' ') || limpio;
  }

  /**
   * Formatear fecha de expiración en español
   */
  formatearFechaExpiracionVoucher(fecha: Date): string {
    if (!fecha) return '';
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dia = dias[fecha.getDay()];
    const numeroDia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    
    return `${dia} ${numeroDia} de ${mes} a las ${hora}:${minutos}`;
  }

  /**
   * Copiar referencia OXXO al portapapeles
   */
  copiarReferencia() {
    if (this.voucherOxxo?.referencia) {
      navigator.clipboard.writeText(this.voucherOxxo.referencia).then(() => {
        alert('Referencia copiada al portapapeles');
      }).catch(err => {
        console.error('Error al copiar:', err);
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = this.voucherOxxo!.referencia;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Referencia copiada al portapapeles');
      });
    }
  }

  /**
   * Descargar voucher OXXO como HTML con diseño Sportconnecta
   */
  descargarVoucher() {
    if (!this.voucherOxxo) return;

    const fechaFormateada = this.formatearFechaExpiracionVoucher(this.voucherOxxo.fechaExpiracion);
    const referenciaFormateada = this.formatearReferencia(this.voucherOxxo.referencia);

    const contenidoVoucher = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Voucher OXXO - Sportconnecta</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .voucher-container {
      max-width: 420px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .voucher-header {
      background: linear-gradient(135deg, #3366ff 0%, #00d68f 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .logo-text span { color: #00d68f; }
    .header-subtitle {
      margin-top: 10px;
      opacity: 0.9;
      font-size: 14px;
    }
    .monto-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      text-align: center;
      border-bottom: 2px dashed #dee2e6;
    }
    .monto-label { color: #666; font-size: 14px; margin-bottom: 5px; }
    .monto-valor {
      font-size: 48px;
      font-weight: 800;
      color: #1a1a2e;
      line-height: 1;
    }
    .monto-currency { font-size: 20px; color: #666; }
    .oxxo-badge {
      display: inline-block;
      background: #d4292c;
      color: white;
      font-weight: bold;
      font-size: 18px;
      padding: 8px 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .datos-pago {
      padding: 25px;
    }
    .dato-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .dato-row:last-child { border-bottom: none; }
    .dato-label { color: #666; font-size: 14px; }
    .dato-value { font-weight: 600; color: #1a1a2e; font-size: 16px; }
    .referencia-box {
      background: #f8f9fa;
      border: 2px solid #3366ff;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .referencia-label { color: #3366ff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .referencia-numero {
      font-size: 26px;
      font-weight: 800;
      color: #1a1a2e;
      letter-spacing: 3px;
      margin-top: 10px;
      font-family: 'Courier New', monospace;
    }
    .barcode {
      height: 60px;
      background: repeating-linear-gradient(
        90deg,
        #000 0px, #000 2px,
        #fff 2px, #fff 4px,
        #000 4px, #000 5px,
        #fff 5px, #fff 8px,
        #000 8px, #000 11px,
        #fff 11px, #fff 13px
      );
      margin: 15px auto 0;
      max-width: 200px;
      border-radius: 4px;
    }
    .instrucciones {
      background: #f0f7ff;
      margin: 0 25px 25px;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #3366ff;
    }
    .instrucciones h4 {
      color: #3366ff;
      margin-bottom: 15px;
      font-size: 14px;
    }
    .instrucciones ol {
      padding-left: 20px;
      color: #444;
      font-size: 14px;
      line-height: 1.8;
    }
    .fecha-limite {
      background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
      padding: 15px 25px;
      text-align: center;
      color: #c0392b;
      font-size: 13px;
    }
    .fecha-limite strong { display: block; margin-top: 5px; }
    .footer {
      background: #1a1a2e;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
    .footer a { color: #00d68f; text-decoration: none; }
    @media print {
      body { background: white; padding: 0; }
      .voucher-container { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="voucher-container">
    <div class="voucher-header">
      <div class="logo-text">Sportconnecta</div>
      <p class="header-subtitle">Ficha de pago para tu reserva</p>
    </div>
    
    <div class="monto-section">
      <div class="monto-label">Monto a pagar</div>
      <div class="monto-valor">$${this.voucherOxxo.monto.toLocaleString('es-MX')}</div>
      <div class="monto-currency">MXN</div>
      <div class="oxxo-badge">Paga en OXXO</div>
    </div>
    
    <div class="datos-pago">
      <div class="referencia-box">
        <div class="referencia-label">Referencia de pago</div>
        <div class="referencia-numero">${referenciaFormateada}</div>
        <div class="barcode"></div>
      </div>
      
      <div class="dato-row">
        <span class="dato-label">Servicio</span>
        <span class="dato-value">Reserva Sportconnecta</span>
      </div>
      <div class="dato-row">
        <span class="dato-label">Entrenador</span>
        <span class="dato-value">${this.entrenador?.nombre || 'N/A'}</span>
      </div>
    </div>
    
    <div class="instrucciones">
      <h4>📋 Instrucciones de pago</h4>
      <ol>
        <li>Acude a cualquier <strong>tienda OXXO</strong></li>
        <li>Indica que harás un <strong>pago de servicio</strong></li>
        <li>Dicta la referencia: <strong>${referenciaFormateada}</strong></li>
        <li>Paga <strong>$${this.voucherOxxo.monto.toLocaleString('es-MX')} MXN</strong> en efectivo</li>
        <li><strong>Conserva tu ticket</strong> como comprobante</li>
      </ol>
    </div>
    
    <div class="fecha-limite">
      ⚠️ Fecha límite de pago
      <strong>${fechaFormateada}</strong>
    </div>
    
    <div class="footer">
      <p>¿Dudas? Contáctanos en <a href="mailto:sportconnecta@gmail.com">sportconnecta@gmail.com</a></p>
      <p style="margin-top: 5px; opacity: 0.7;">© ${new Date().getFullYear()} Sportconnecta</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([contenidoVoucher], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voucher-sportconnecta-${this.voucherOxxo.referencia}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generar referencia OXXO simulada (14 dígitos)
   */
  generarReferenciaSimulada(): string {
    return Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
  }
}
