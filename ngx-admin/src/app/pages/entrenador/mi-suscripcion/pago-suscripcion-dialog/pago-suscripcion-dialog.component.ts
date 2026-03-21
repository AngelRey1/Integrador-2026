import { Component, Input } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService } from '../../../../@core/services/entrenador-firebase.service';

@Component({
  selector: 'ngx-pago-suscripcion-dialog',
  templateUrl: './pago-suscripcion-dialog.component.html',
  styleUrls: ['./pago-suscripcion-dialog.component.scss']
})
export class PagoSuscripcionDialogComponent {
  @Input() plan: any; // { id, nombre, precio, periodo }

  archivoSeleccionado: File | null = null;
  loading: boolean = false;

  constructor(
    protected ref: NbDialogRef<PagoSuscripcionDialogComponent>,
    private entrenadorFirebase: EntrenadorFirebaseService,
    private toastr: NbToastrService
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        this.archivoSeleccionado = file;
      } else {
        this.toastr.warning('Por favor sube una imagen o PDF del comprobante', 'Formato Inválido');
      }
    }
  }

  async enviarComprobante() {
    if (!this.archivoSeleccionado || !this.plan) return;

    this.loading = true;
    const result = await this.entrenadorFirebase.registrarPagoSuscripcion(
      this.plan.id, 
      this.plan.precio, 
      this.archivoSeleccionado
    );

    this.loading = false;
    if (result.success) {
      this.toastr.success(result.message, 'Comprobante Enviado');
      this.ref.close(true); // Retorna true si fue exitoso
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  cancelar() {
    this.ref.close(false);
  }
}
