import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteFirebaseService, Entrenador, Reserva } from '../../@core/services/cliente-firebase.service';
import { StripeService, PaymentResult } from '../../@core/services/stripe.service';
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

  pasos: Paso[] = [
    { numero: 1, titulo: 'Fecha y Hora', icono: 'calendar-outline', completado: false },
    { numero: 2, titulo: 'Modalidad', icono: 'options-outline', completado: false },
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
    private stripeService: StripeService
  ) {
    this.fechaMinima = new Date().toISOString().split('T')[0];

    this.paso1Form = this.fb.group({
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      cantidadPersonas: [1, [Validators.required, Validators.min(1)]]
    });

    this.paso2Form = this.fb.group({
      modalidad: ['presencial', Validators.required],
      ubicacion: [''],
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
      // Campos para OXXO
      emailOxxo: [''],
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
        return this.paso1Form.valid;
      case 2:
        return this.paso2Form.valid;
      case 3:
        return this.paso3Form.valid;
      case 4:
        return this.paso4Form.valid;
      default:
        return true;
    }
  }

  /**
   * Actualizar validaciones del formulario según el método de pago seleccionado
   */
  actualizarValidacionesPago(metodo: string) {
    const tarjetaControls = ['numeroTarjeta', 'nombreTitular', 'fechaExpiracion', 'cvv'];
    const oxxoControls = ['emailOxxo'];

    if (metodo === 'tarjeta') {
      // Activar validaciones de tarjeta
      this.paso4Form.get('numeroTarjeta')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      this.paso4Form.get('nombreTitular')?.setValidators([Validators.required]);
      this.paso4Form.get('fechaExpiracion')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      this.paso4Form.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      // Desactivar validaciones de OXXO
      this.paso4Form.get('emailOxxo')?.clearValidators();
    } else if (metodo === 'oxxo') {
      // Desactivar validaciones de tarjeta
      tarjetaControls.forEach(control => {
        this.paso4Form.get(control)?.clearValidators();
        this.paso4Form.get(control)?.setValue('');
      });
      // Activar validaciones de OXXO
      this.paso4Form.get('emailOxxo')?.setValidators([Validators.required, Validators.email]);
    }

    // Actualizar validez de todos los controles
    [...tarjetaControls, ...oxxoControls].forEach(control => {
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
    const precioFinal = this.calcularPrecioTotal() || this.entrenador?.precio || 350;
    const email = this.paso4Form.get('emailOxxo')?.value || this.paso3Form.get('email')?.value;
    const nombre = this.paso3Form.get('nombre')?.value;

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
        this.mostrarVoucherOxxo = true;
        console.log('Voucher OXXO simulado generado:', this.voucherOxxo);
      }, 1500);
      
      return;
    }

    // Modo real: usar Stripe
    const montoEnCentavos = Math.round(precioFinal * 100);

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
          this.mostrarVoucherOxxo = true;
          console.log('Voucher OXXO generado:', this.voucherOxxo);
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
    const montoEnCentavos = Math.round(this.calcularPrecioTotal() * 100);
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

    // Crear la reserva en Firebase
    const fechaReserva = new Date(this.paso1Form.get('fecha')?.value);
    const horaInicio = this.paso1Form.get('horaInicio')?.value;
    const horaFin = this.paso1Form.get('horaFin')?.value;

    // Combinar fecha y hora de inicio
    const [horas, minutos] = horaInicio.split(':').map(Number);
    fechaReserva.setHours(horas, minutos, 0, 0);

    const reservaData: Omit<Reserva, 'id' | 'clienteId' | 'fechaCreacion'> = {
      entrenadorId: this.entrenador.id!,
      entrenadorNombre: this.entrenador.nombre + ' ' + (this.entrenador.apellidoPaterno || ''),
      clienteNombre: this.paso3Form.get('nombre')?.value,
      fecha: fechaReserva,
      hora: horaInicio,
      horaFin: horaFin,
      duracion: this.getDuracionSesion(),
      precio: this.calcularPrecioTotal(),
      modalidad: this.paso2Form.get('modalidad')?.value,
      estado: 'PENDIENTE',
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
   * Descargar voucher OXXO como imagen/PDF
   */
  descargarVoucher() {
    if (!this.voucherOxxo) return;

    // Crear contenido HTML del voucher
    const contenidoVoucher = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher OXXO - ${this.voucherOxxo.referencia}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
          .voucher { border: 2px solid #d4292c; border-radius: 10px; padding: 20px; }
          .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
          .oxxo-logo { background: #d4292c; color: white; font-weight: bold; font-size: 24px; padding: 10px 20px; display: inline-block; border-radius: 5px; }
          .monto { text-align: center; font-size: 32px; font-weight: bold; color: #d4292c; margin: 20px 0; }
          .referencia { text-align: center; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .referencia-numero { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
          .expiracion { color: #ff6b6b; text-align: center; margin: 15px 0; }
          .instrucciones { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .instrucciones ol { margin: 10px 0; padding-left: 20px; }
          .instrucciones li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="voucher">
          <div class="header">
            <div class="oxxo-logo">OXXO</div>
            <p>Ficha de pago</p>
          </div>
          <div class="monto">$${this.voucherOxxo.monto} MXN</div>
          <div class="referencia">
            <p>Referencia de pago:</p>
            <div class="referencia-numero">${this.voucherOxxo.referencia}</div>
          </div>
          <div class="expiracion">
            ⚠️ Paga antes del ${this.voucherOxxo.fechaExpiracion.toLocaleDateString('es-MX')}
          </div>
          <div class="instrucciones">
            <strong>Instrucciones:</strong>
            <ol>
              <li>Acude a cualquier tienda OXXO</li>
              <li>Indica que deseas realizar un pago de servicio</li>
              <li>Proporciona la referencia: ${this.voucherOxxo.referencia}</li>
              <li>Paga $${this.voucherOxxo.monto} MXN en efectivo</li>
              <li>Conserva tu ticket como comprobante</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `;

    // Crear blob y descargar
    const blob = new Blob([contenidoVoucher], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voucher-oxxo-${this.voucherOxxo.referencia}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Formatear referencia OXXO con espacios para mejor legibilidad
   * Ej: 38982927518118 -> 3898 2927 5181 18
   */
  formatearReferencia(referencia: string): string {
    if (!referencia) return '0000 0000 0000 00';
    // Agrupar en bloques de 4 dígitos
    return referencia.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Generar referencia OXXO simulada (14 dígitos)
   */
  generarReferenciaSimulada(): string {
    return Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
  }
}
