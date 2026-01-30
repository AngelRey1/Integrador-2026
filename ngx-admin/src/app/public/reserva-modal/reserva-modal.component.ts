import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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

// Mock Data (Duplicado temporalmente para demo, idealmente en un servicio)
const ENTRENADORES_MOCK = [
  { id: 1, nombre: 'Carlos Méndez', deporte: 'Fútbol', precio: 350, whatsapp: '529991234567' },
  { id: 2, nombre: 'Ana García', deporte: 'Yoga', precio: 280, whatsapp: '529997654321' },
  { id: 3, nombre: 'Jorge Sánchez', deporte: 'CrossFit', precio: 420, whatsapp: '529991112223' },
  { id: 4, nombre: 'María López', deporte: 'Running', precio: 300, whatsapp: '529994445556' },
  { id: 14, nombre: 'Camila Reyes', deporte: 'Ballet Fitness', precio: 330, whatsapp: '529998889990' },
  // ... otros si es necesario
];

@Component({
  selector: 'ngx-reserva-modal',
  templateUrl: './reserva-modal.component.html',
  styleUrls: ['./reserva-modal.component.scss']
})
export class ReservaModalComponent implements OnInit {
  pasoActual = 1;
  totalPasos = 5;
  fechaMinima: string;
  entrenador: any;

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
  duraciones = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' }
  ];

  modalidades = [
    { value: 'presencial', label: 'Presencial', icono: 'people-outline', desc: 'Entrenamiento en persona' },
    { value: 'online', label: 'En línea', icono: 'monitor-outline', desc: 'Entrenamiento por videollamada' }
  ];

  enviando = false;
  reservaConfirmada = false;
  numeroReserva = '';
  pagoCompletado = false;
  procesandoPago = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.fechaMinima = new Date().toISOString().split('T')[0];

    this.paso1Form = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      duracion: [60, Validators.required],
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
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      nombreTitular: ['', Validators.required],
      fechaExpiracion: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      aceptaPoliticas: [false, Validators.requiredTrue]
    });
  }

  // Variables para cupos
  cuposTotales = 10;
  cuposDisponibles = 10;

  ngOnInit() {
    // 1. Obtener ID del entrenador de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.entrenador = ENTRENADORES_MOCK.find(e => e.id === +id) || { nombre: 'Entrenador', deporte: 'General', precio: 0 };
    }

    this.generarHorarios();

    // Listener para generar horarios cuando cambia la fecha
    this.paso1Form.get('fecha')?.valueChanges.subscribe((fecha) => {
      this.generarHorarios();
      this.cargarCupos(fecha);
      this.validarCupos();
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

  cargarCupos(fecha: Date | null) {
    if (!fecha || !this.entrenador?.id) return;

    // Convertir fecha a string YYYY-MM-DD para la clave
    const fechaObj = new Date(fecha);
    const fechaStr = fechaObj.toISOString().split('T')[0];
    const storageKey = `cupos_${this.entrenador.id}_${fechaStr}`;

    const cuposGuardados = localStorage.getItem(storageKey);

    if (cuposGuardados) {
      this.cuposDisponibles = parseInt(cuposGuardados, 10);
    } else {
      // Valor por defecto si no hay registro
      this.cuposDisponibles = 10;
    }

    // Validar si la cantidad seleccionada previamente sigue siendo válida
    this.validarCupos();
  }

  actualizarCuposReserva() {
    const cantidad = this.paso1Form.get('cantidadPersonas')?.value || 1;
    const fecha = this.paso1Form.get('fecha')?.value;

    if (!fecha || !this.entrenador?.id) return;

    const fechaStr = new Date(fecha).toISOString().split('T')[0];
    const storageKey = `cupos_${this.entrenador.id}_${fechaStr}`;

    // Obtener cupos actuales (o 10 por defecto) y restar
    let cuposActuales = parseInt(localStorage.getItem(storageKey) || '10', 10);
    cuposActuales = Math.max(0, cuposActuales - cantidad);

    // Guardar nuevo valor
    localStorage.setItem(storageKey, cuposActuales.toString());
    this.cuposDisponibles = cuposActuales;
  }

  validarCupos() {
    const cantidad = this.paso1Form.get('cantidadPersonas')?.value || 1;
    if (cantidad > this.cuposDisponibles) {
      this.paso1Form.get('cantidadPersonas')?.setErrors({ excedeCupos: true });
    } else {
      this.paso1Form.get('cantidadPersonas')?.setErrors(null);
    }
  }

  generarHorarios() {
    // Generar horarios de 8:00 a 20:00 con DISPONIBILIDAD SIMULADA
    const horarios: Horario[] = [];

    // Seed básico basado en la fecha (si hay fecha seleccionada) para que sea consistente al cambiar
    // Si no hay fecha, es random cada vez.
    const fechaSeleccionada = this.paso1Form.get('fecha')?.value;

    for (let hora = 8; hora <= 19; hora++) {
      const horaStr = `${hora.toString().padStart(2, '0')}:00`;
      // SIMULACION: Si la hora es par, hay 30% chance de estar lleno. Si es impar, 10%.
      // Esto es solo para demo visual.
      let disponible = true;
      if (fechaSeleccionada) {
        // Lógica determinista simple para demo: 'random' basado en suma de caracteres de fecha + hora
        const seed = fechaSeleccionada.toString().length + hora;
        if (seed % 7 === 0 || seed % 5 === 0) disponible = false; // Algunos randoms no disponibles
      }

      horarios.push({ hora: horaStr, disponible: disponible });

      if (hora < 19) {
        const mediaHoraStr = `${hora.toString().padStart(2, '0')}:30`;
        let disponibleMedia = true;
        if (fechaSeleccionada) {
          const seedMedia = fechaSeleccionada.toString().length + hora + 30;
          if (seedMedia % 9 === 0) disponibleMedia = false;
        }
        horarios.push({ hora: mediaHoraStr, disponible: disponibleMedia });
      }
    }
    this.horariosDisponibles = horarios;
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

  procesarPago() {
    if (!this.paso4Form.valid) {
      alert('Por favor completa todos los datos de pago');
      return;
    }

    this.procesandoPago = true;

    // Simular procesamiento de pago con Stripe
    setTimeout(() => {
      console.log('Procesando pago:', {
        monto: this.calcularPrecioTotal(),
        metodo: this.paso4Form.get('metodoPago')?.value,
        ultimosDigitos: this.paso4Form.get('numeroTarjeta')?.value.slice(-4)
      });

      // Simular éxito del pago
      this.procesandoPago = false;
      this.pagoCompletado = true;
      this.pasos[3].completado = true;
      this.pasoActual = 5; // Ir a confirmación
    }, 2000);
  }

  confirmarReserva() {
    if (!this.pagoCompletado) {
      alert('Por favor completa el pago primero');
      return;
    }

    this.enviando = true;

    // Simular envío de reserva después del pago
    setTimeout(() => {
      const reservaData = {
        entrenador: this.entrenador,
        ...this.paso1Form.value,
        ...this.paso2Form.value,
        ...this.paso3Form.value,
        pago: {
          monto: this.calcularPrecioTotal(),
          metodo: this.paso4Form.get('metodoPago')?.value,
          completado: true,
          fecha: new Date().toISOString()
        }
      };

      console.log('Reserva confirmada con pago:', reservaData);

      // Actualizar cupos en localStorage
      this.actualizarCuposReserva();

      this.enviando = false;
      this.reservaConfirmada = true;
      this.numeroReserva = 'RSV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }, 1500);
  }

  calcularPrecioTotal(): number {
    const duracion = this.paso1Form.get('duracion')?.value || 60;
    const precioHora = this.entrenador?.precio || 0; // Fixed prop name from precioHora to precio (based on mock)
    const personas = this.paso1Form.get('cantidadPersonas')?.value || 1;
    return ((duracion / 60) * precioHora) * personas;
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
}
