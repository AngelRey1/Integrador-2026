import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Entrenador {
  id: number;
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
export class AgendarSesionComponent implements OnInit {
  // Stepper
  pasoActual = 0;
  
  // Forms
  paso1Form: FormGroup;
  paso2Form: FormGroup;
  paso3Form: FormGroup;
  paso4Form: FormGroup;

  // Datos
  entrenadorId: number | null = null;
  entrenadorSeleccionado: Entrenador | null = null;
  
  entrenadores: Entrenador[] = [
    {
      id: 1,
      nombre_completo: 'Ana Pérez García',
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Yoga & Pilates',
      tarifa_por_hora: 30,
      calificacion: 4.8,
      total_resenas: 45
    },
    {
      id: 2,
      nombre_completo: 'Carlos Ruiz López',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      especialidad: 'CrossFit & Funcional',
      tarifa_por_hora: 35,
      calificacion: 4.9,
      total_resenas: 67
    },
    {
      id: 3,
      nombre_completo: 'María González',
      foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Running & Atletismo',
      tarifa_por_hora: 25,
      calificacion: 4.7,
      total_resenas: 32
    }
  ];

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
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
    // Verificar si viene ID de entrenador por parámetro
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.entrenadorId = parseInt(id);
        this.seleccionarEntrenador(this.entrenadorId);
        this.paso1Form.patchValue({ entrenador_id: this.entrenadorId });
      }
    });

    // Listener para calcular precio al cambiar duración
    this.paso3Form.get('duracion')?.valueChanges.subscribe(() => {
      this.calcularPrecio();
    });
  }

  // Paso 1: Selección de entrenador
  seleccionarEntrenador(id: number): void {
    this.entrenadorSeleccionado = this.entrenadores.find(e => e.id === id) || null;
    this.paso1Form.patchValue({ entrenador_id: id });
    this.calcularPrecio();
  }

  // Paso 2: Generar horarios disponibles cuando se selecciona fecha
  onFechaSeleccionada(fecha: Date): void {
    this.horariosDisponibles = this.generarHorariosDisponibles(fecha);
  }

  generarHorariosDisponibles(fecha: Date): string[] {
    // Mock: generar horarios de 8:00 a 20:00
    const horarios: string[] = [];
    for (let hora = 8; hora <= 19; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      if (hora < 19) {
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
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

  // Confirmar reserva
  confirmarReserva(): void {
    if (!this.paso4Form.valid) return;

    this.cargando = true;

    // Simular llamada API
    setTimeout(() => {
      this.reservaConfirmada = true;
      this.numeroReserva = 'RSV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.cargando = false;
      this.pasoActual++;
    }, 2000);
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
