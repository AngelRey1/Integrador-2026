import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteFirebaseService, Entrenador as EntrenadorFirebase } from '../../../@core/services/cliente-firebase.service';
import { NbToastrService } from '@nebular/theme';
import { Subscription } from 'rxjs';

interface Entrenador {
  id: string;
  nombre_completo: string;
  foto_url: string;
  especialidad: string;
  tarifa_por_hora: number;
  calificacion: number;
  total_resenas: number;
}

interface HorarioDisponible {
  fecha: Date;
  hora: string;
  disponible: boolean;
}

interface MetodoPago {
  id: string;
  tipo: string;
  ultimos_digitos?: string;
  icono: string;
}

@Component({
  selector: 'ngx-agendar-sesion',
  templateUrl: './agendar-sesion.component.html',
  styleUrls: ['./agendar-sesion.component.scss']
})
export class AgendarSesionComponent implements OnInit, OnDestroy {
  // Stepper
  pasoActual = 0;
  
  // Forms
  paso1Form: FormGroup;
  paso2Form: FormGroup;
  paso3Form: FormGroup;
  paso4Form: FormGroup;

  // Datos
  entrenadorId: string | null = null;
  entrenadorSeleccionado: Entrenador | null = null;
  
  // Lista de entrenadores desde Firebase
  entrenadores: Entrenador[] = [];
  loadingEntrenadores = true;

  // Paso 2: Horarios disponibles
  fechaMinima = new Date();
  fechaMaxima = new Date(new Date().setMonth(new Date().getMonth() + 2));
  horariosDisponibles: string[] = [];

  // Paso 3: Configuración
  duraciones = [
    { value: 0.5, label: '30 minutos' },
    { value: 1, label: '1 hora' },
    { value: 1.5, label: '1.5 horas' },
    { value: 2, label: '2 horas' }
  ];

  modalidades = [
    { value: 'presencial', label: 'Presencial', icono: 'person-outline' },
    { value: 'online', label: 'Online', icono: 'monitor-outline' }
  ];

  // Paso 4: Métodos de pago
  metodosPago: MetodoPago[] = [
    { id: 'card1', tipo: 'Tarjeta Visa', ultimos_digitos: '4242', icono: 'credit-card-outline' },
    { id: 'card2', tipo: 'Tarjeta Mastercard', ultimos_digitos: '5555', icono: 'credit-card-outline' },
    { id: 'paypal', tipo: 'PayPal', icono: 'globe-outline' },
    { id: 'nueva', tipo: 'Nueva tarjeta', icono: 'plus-circle-outline' }
  ];

  // Resumen y cálculo
  precioTotal = 0;
  comision = 0;
  totalFinal = 0;

  // Estados
  cargando = false;
  reservaConfirmada = false;
  numeroReserva = '';
  
  // Suscripciones
  private subscriptions: Subscription[] = [];
  private horariosOcupados: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private clienteFirebase: ClienteFirebaseService,
    private toastr: NbToastrService
  ) {
    // Inicializar formularios
    this.paso1Form = this.fb.group({
      entrenador_id: [null, Validators.required]
    });

    this.paso2Form = this.fb.group({
      fecha: [null, Validators.required],
      hora: [null, Validators.required]
    });

    this.paso3Form = this.fb.group({
      duracion: [1, Validators.required],
      modalidad: ['presencial', Validators.required],
      notas: ['']
    });

    this.paso4Form = this.fb.group({
      metodo_pago: [null, Validators.required],
      acepto_terminos: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Cargar entrenadores desde Firebase
    this.cargarEntrenadores();

    // Verificar si viene ID de entrenador por parámetro
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.entrenadorId = id;
        // Esperar a que se carguen los entrenadores
        setTimeout(() => {
          this.seleccionarEntrenador(id);
          this.paso1Form.patchValue({ entrenador_id: id });
        }, 500);
      }
    });

    // Listener para calcular precio al cambiar duración
    this.paso3Form.get('duracion')?.valueChanges.subscribe(() => {
      this.calcularPrecio();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private cargarEntrenadores(): void {
    this.loadingEntrenadores = true;
    const sub = this.clienteFirebase.getEntrenadores().subscribe(
      (entrenadores) => {
        this.entrenadores = entrenadores.map(e => ({
          id: e.id || '',
          nombre_completo: `${e.nombre} ${e.apellidoPaterno || ''}`.trim(),
          foto_url: e.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          especialidad: e.deportes?.join(', ') || 'Entrenamiento',
          tarifa_por_hora: e.precio || 300,
          calificacion: e.calificacionPromedio || 5.0,
          total_resenas: e.totalReviews || 0
        }));
        this.loadingEntrenadores = false;
        
        // Si venía con ID, seleccionar ahora
        if (this.entrenadorId) {
          this.seleccionarEntrenador(this.entrenadorId);
        }
      },
      (error) => {
        console.error('Error cargando entrenadores:', error);
        this.loadingEntrenadores = false;
        this.toastr.danger('Error al cargar entrenadores', 'Error');
      }
    );
    this.subscriptions.push(sub);
  }

  // Paso 1: Selección de entrenador
  seleccionarEntrenador(id: string): void {
    this.entrenadorSeleccionado = this.entrenadores.find(e => e.id === id) || null;
    this.paso1Form.patchValue({ entrenador_id: id });
    this.calcularPrecio();
  }

  // Paso 2: Generar horarios disponibles cuando se selecciona fecha
  onFechaSeleccionada(fecha: Date): void {
    if (!this.entrenadorSeleccionado) return;
    
    // Obtener horarios ocupados del entrenador para esa fecha
    this.clienteFirebase.getHorariosOcupados(this.entrenadorSeleccionado.id, fecha).subscribe(
      (ocupados) => {
        this.horariosOcupados = ocupados;
        this.horariosDisponibles = this.generarHorariosDisponibles(fecha);
      }
    );
  }

  generarHorariosDisponibles(fecha: Date): string[] {
    // Generar horarios de 8:00 a 20:00, excluyendo los ocupados
    const horarios: string[] = [];
    for (let hora = 8; hora <= 19; hora++) {
      const h1 = `${hora.toString().padStart(2, '0')}:00`;
      const h2 = `${hora.toString().padStart(2, '0')}:30`;
      
      if (!this.horariosOcupados.includes(h1)) {
        horarios.push(h1);
      }
      if (hora < 19 && !this.horariosOcupados.includes(h2)) {
        horarios.push(h2);
      }
    }
    return horarios;
  }

  // Cálculo de precio
  calcularPrecio(): void {
    if (!this.entrenadorSeleccionado) return;

    const duracion = this.paso3Form.get('duracion')?.value || 1;
    this.precioTotal = this.entrenadorSeleccionado.tarifa_por_hora * duracion;
    this.comision = this.precioTotal * 0.1; // 10% comisión
    this.totalFinal = this.precioTotal + this.comision;
  }

  // Navegación del stepper
  siguientePaso(): void {
    if (this.validarPasoActual()) {
      if (this.pasoActual === 2) {
        this.calcularPrecio();
      }
      this.pasoActual++;
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 0) {
      this.pasoActual--;
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual) {
      case 0:
        return this.paso1Form.valid;
      case 1:
        return this.paso2Form.valid;
      case 2:
        return this.paso3Form.valid;
      case 3:
        return this.paso4Form.valid;
      default:
        return false;
    }
  }

  // Confirmar reserva - REAL con Firebase
  async confirmarReserva(): Promise<void> {
    if (!this.paso4Form.valid || !this.entrenadorSeleccionado) return;

    this.cargando = true;

    try {
      const fecha = this.paso2Form.get('fecha')?.value;
      const hora = this.paso2Form.get('hora')?.value;
      const duracion = this.paso3Form.get('duracion')?.value;
      const modalidad = this.paso3Form.get('modalidad')?.value;
      const notas = this.paso3Form.get('notas')?.value;

      // Calcular hora fin
      const [h, m] = hora.split(':').map(Number);
      const minutosTotales = h * 60 + m + (duracion * 60);
      const horaFin = `${Math.floor(minutosTotales / 60).toString().padStart(2, '0')}:${(minutosTotales % 60).toString().padStart(2, '0')}`;

      const result = await this.clienteFirebase.crearReserva({
        entrenadorId: this.entrenadorSeleccionado.id,
        entrenadorNombre: this.entrenadorSeleccionado.nombre_completo,
        clienteNombre: '', // Se llena en el servicio
        fecha: fecha,
        hora: hora,
        horaFin: horaFin,
        duracion: duracion,
        precio: this.totalFinal,
        modalidad: modalidad,
        estado: 'PENDIENTE',
        notas: notas || '',
        ubicacion: modalidad === 'presencial' ? 'Por confirmar' : 'Online'
      });

      if (result.success) {
        this.reservaConfirmada = true;
        this.numeroReserva = result.id || 'RSV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        this.pasoActual++;
        this.toastr.success('Tu reserva ha sido creada', 'Reserva Confirmada');
      } else {
        this.toastr.danger(result.message, 'Error');
      }
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      this.toastr.danger('Error al procesar la reserva', 'Error');
    } finally {
      this.cargando = false;
    }
  }

  // Finalizar y volver
  volverAReservas(): void {
    this.router.navigate(['/pages/cliente/mis-reservas']);
  }

  nuevaReserva(): void {
    this.router.navigate(['/pages/cliente/buscar-entrenadores']);
  }

  cerrarModal(): void {
    // Confirmar si tiene datos sin guardar
    if (this.pasoActual > 0 && !this.reservaConfirmada) {
      if (confirm('¿Seguro que deseas salir? Perderás los datos ingresados.')) {
        this.router.navigate(['/pages/cliente/cliente-dashboard']);
      }
    } else {
      this.router.navigate(['/pages/cliente/cliente-dashboard']);
    }
  }

  // Utilidades
  getEstrellas(calificacion: number): number[] {
    return Array(Math.floor(calificacion)).fill(0);
  }

  getEstrellasVacias(calificacion: number): number[] {
    return Array(5 - Math.floor(calificacion)).fill(0);
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  }

  getDuracionLabel(duracion: number): string {
    return this.duraciones.find(d => d.value === duracion)?.label || '';
  }

  getModalidadLabel(modalidad: string): string {
    return this.modalidades.find(m => m.value === modalidad)?.label || '';
  }

  getMetodoPagoSeleccionado(): MetodoPago | undefined {
    const id = this.paso4Form.get('metodo_pago')?.value;
    return this.metodosPago.find(m => m.id === id);
  }
}
