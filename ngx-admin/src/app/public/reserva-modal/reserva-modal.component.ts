import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reserva-modal',
  templateUrl: './reserva-modal.component.html',
  styleUrls: ['./reserva-modal.component.scss']
})
export class ReservaModalComponent {
  formulario = {
    nombreCliente: '',
    email: '',
    telefono: '',
    fechaPreferida: '',
    horaPreferida: '',
    notas: '',
    modalidad: 'presencial'
  };

  enviando = false;
  enviado = false;

  constructor(
    public dialogRef: MatDialogRef<ReservaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  enviarReserva() {
    if (!this.validarFormulario()) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.enviando = true;

    // Simular envío
    setTimeout(() => {
      // Aquí irá la lógica de envío a backend + WhatsApp chatbot
      console.log('Reserva enviada:', { ...this.formulario, entrenador: this.data.entrenador });
      
      this.enviando = false;
      this.enviado = true;

      // Cerrar después de 2 segundos
      setTimeout(() => {
        this.dialogRef.close({ success: true, formulario: this.formulario });
      }, 2000);
    }, 1500);
  }

  validarFormulario(): boolean {
    return this.formulario.nombreCliente.trim() !== '' &&
           this.formulario.email.trim() !== '' &&
           this.formulario.telefono.trim() !== '' &&
           this.formulario.fechaPreferida.trim() !== '' &&
           this.formulario.horaPreferida.trim() !== '';
  }

  cancelar() {
    this.dialogRef.close();
  }
}
