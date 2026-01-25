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
  totalPasos = 4;
  fechaMinima: string;
  
  pasos: Paso[] = [
    { numero: 1, titulo: 'Fecha y Hora', icono: 'calendar-outline', completado: false },
    { numero: 2, titulo: 'Modalidad', icono: 'options-outline', completado: false },
    { numero: 3, titulo: 'Tus Datos', icono: 'person-outline', completado: false },
    { numero: 4, titulo: 'Confirmación', icono: 'checkmark-circle-outline', completado: false }
  ];

  // Forms por paso
  paso1Form: FormGroup;
  paso2Form: FormGroup;
  paso3Form: FormGroup;

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
      default:
        return true;
    }
  }

  confirmarReserva() {
    if (!this.paso3Form.valid) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.enviando = true;

    // Simular envío
    setTimeout(() => {
      const reservaData = {
        entrenador: this.data.entrenador,
        ...this.paso1Form.value,
        ...this.paso2Form.value,
        ...this.paso3Form.value
      };
      
      console.log('Reserva enviada:', reservaData);
      
      this.enviando = false;
      this.reservaConfirmada = true;
      this.numeroReserva = 'RSV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.pasoActual = 4;
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

  contactarWhatsApp() {
    const telefono = this.data.entrenador.whatsapp || '529999999999';
    const mensaje = `Hola ${this.data.entrenador.nombre}, me gustaría agendar una sesión.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
