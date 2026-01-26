import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Paso {
  numero: number;
  titulo: string;
  icono: string;
  completado: boolean;
}

@Component({
  selector: 'ngx-reserva-modal',
  templateUrl: './reserva-modal.component.html',
  styleUrls: ['./reserva-modal.component.scss']
})
export class ReservaModalComponent implements OnInit {
  pasoActual = 1;
  totalPasos = 5;
  fechaMinima: string;
  
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
  horariosDisponibles: string[] = [];
  duraciones = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' }
  ];

  modalidades = [
    { value: 'presencial', label: 'Presencial', icono: 'people-outline', desc: 'Entrenamiento en persona' },
    { value: 'online', label: 'Online', icono: 'monitor-outline', desc: 'Entrenamiento por videollamada' }
  ];

  enviando = false;
  reservaConfirmada = false;
  numeroReserva = '';
  pagoCompletado = false;
  procesandoPago = false;

  constructor(
    public dialogRef: MatDialogRef<ReservaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.fechaMinima = new Date().toISOString().split('T')[0];
    
    this.paso1Form = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      duracion: [60, Validators.required]
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

  ngOnInit() {
    this.generarHorarios();
    
    // Listener para generar horarios cuando cambia la fecha
    this.paso1Form.get('fecha')?.valueChanges.subscribe(() => {
      this.generarHorarios();
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

  generarHorarios() {
    // Generar horarios de 8:00 a 20:00
    const horarios: string[] = [];
    for (let hora = 8; hora <= 19; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      if (hora < 19) {
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
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
      // En producción, aquí se haría la llamada real a Stripe
      // const stripe = await loadStripe('tu-clave-publica-stripe');
      // const result = await stripe.confirmCardPayment(...);
      
      console.log('Procesando pago:', {
        monto: this.calcularPrecioTotal(),
        metodo: this.paso4Form.get('metodoPago')?.value,
        // En producción, no se enviarían los datos de tarjeta completos
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
        entrenador: this.data.entrenador,
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
      
      this.enviando = false;
      this.reservaConfirmada = true;
      this.numeroReserva = 'RSV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }, 1500);
  }

  calcularPrecioTotal(): number {
    const duracion = this.paso1Form.get('duracion')?.value || 60;
    const precioHora = this.data.entrenador.precioHora || 0;
    return (duracion / 60) * precioHora;
  }

  cerrar() {
    if (this.reservaConfirmada) {
      this.dialogRef.close({ success: true });
    } else if (this.pasoActual > 1) {
      if (confirm('¿Seguro que deseas salir? Perderás los datos ingresados.')) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  formatearTarjeta(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(.{4})/g, '$1 ').trim();
    this.paso4Form.patchValue({ numeroTarjeta: value }, { emitEvent: false });
    // Actualizar el valor visual del input
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
    // Actualizar el valor visual del input
    if (event.target.value !== formatted) {
      event.target.value = formatted;
    }
  }

  contactarWhatsApp() {
    const telefono = this.data.entrenador.whatsapp || '529999999999';
    const mensaje = `Hola ${this.data.entrenador.nombre}, me gustaría agendar una sesión.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
