import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ClienteFirebaseService } from '../../../@core/services/cliente-firebase.service';

@Component({
  selector: 'ngx-resena-dialog',
  templateUrl: './resena-dialog.component.html',
  styleUrls: ['./resena-dialog.component.scss']
})
export class ResenaDialogComponent {
  @Input() reservaId!: string;
  @Input() entrenadorId!: string;
  @Input() entrenadorNombre!: string;
  @Input() entrenadorFoto?: string;

  calificacion = 0;
  comentario = '';
  guardando = false;
  hoverRating = 0;

  constructor(
    protected dialogRef: NbDialogRef<ResenaDialogComponent>,
    private clienteFirebase: ClienteFirebaseService
  ) {}

  setRating(rating: number): void {
    this.calificacion = rating;
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  clearHover(): void {
    this.hoverRating = 0;
  }

  async guardarResena(): Promise<void> {
    if (this.calificacion === 0) {
      return;
    }

    this.guardando = true;

    const result = await this.clienteFirebase.crearResena({
      entrenadorId: this.entrenadorId,
      reservaId: this.reservaId,
      calificacion: this.calificacion,
      comentario: this.comentario.trim()
    });

    this.guardando = false;

    this.dialogRef.close({
      success: result.success,
      message: result.message
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getStarClass(star: number): string {
    const currentRating = this.hoverRating || this.calificacion;
    if (star <= currentRating) {
      return 'star filled';
    }
    return 'star';
  }
}
