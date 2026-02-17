import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { AdminFirebaseService, DocumentosEntrenador, Entrenador } from '../../../../core/services/admin-firebase.service';

@Component({
  selector: 'app-documentos-dialog',
  templateUrl: './documentos-dialog.component.html',
  styleUrls: ['./documentos-dialog.component.scss']
})
export class DocumentosDialogComponent implements OnInit {
  @Input() entrenador!: Entrenador;
  
  documentos: DocumentosEntrenador | null = null;
  loading = true;
  procesando = false;
  motivoRechazo = '';
  mostrarInputRechazo = false;

  constructor(
    protected dialogRef: NbDialogRef<DocumentosDialogComponent>,
    private adminFirebase: AdminFirebaseService
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  async cargarDocumentos(): Promise<void> {
    this.loading = true;
    if (this.entrenador.id) {
      this.documentos = await this.adminFirebase.getDocumentosEntrenador(this.entrenador.id);
    }
    this.loading = false;
  }

  async aprobarDocumentos(): Promise<void> {
    if (!this.entrenador.id) return;
    
    this.procesando = true;
    const result = await this.adminFirebase.aprobarDocumentos(this.entrenador.id);
    this.procesando = false;
    
    this.dialogRef.close({ action: 'aprobado', success: result.success, message: result.message });
  }

  mostrarRechazo(): void {
    this.mostrarInputRechazo = true;
  }

  cancelarRechazo(): void {
    this.mostrarInputRechazo = false;
    this.motivoRechazo = '';
  }

  async rechazarDocumentos(): Promise<void> {
    if (!this.entrenador.id || !this.motivoRechazo.trim()) return;
    
    this.procesando = true;
    const result = await this.adminFirebase.rechazarDocumentos(this.entrenador.id, this.motivoRechazo);
    this.procesando = false;
    
    this.dialogRef.close({ action: 'rechazado', success: result.success, message: result.message });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getEstadoBadge(): string {
    const estado = this.documentos?.estadoVerificacion || 'PENDIENTE';
    switch (estado) {
      case 'APROBADO': return 'success';
      case 'RECHAZADO': return 'danger';
      default: return 'warning';
    }
  }

  getEstadoTexto(): string {
    const estado = this.documentos?.estadoVerificacion || 'PENDIENTE';
    switch (estado) {
      case 'APROBADO': return 'Aprobados';
      case 'RECHAZADO': return 'Rechazados';
      default: return 'Pendientes de revisión';
    }
  }

  esImagen(tipo: string): boolean {
    return tipo?.startsWith('image/');
  }

  abrirEnNuevaVentana(base64: string): void {
    const win = window.open();
    if (win) {
      win.document.write(`<img src="${base64}" style="max-width: 100%; height: auto;">`);
    }
  }
}
