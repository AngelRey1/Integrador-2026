import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { AdminFirebaseService, Entrenador as EntrenadorFirebase } from '../../../../core/services/admin-firebase.service';
import { DocumentosDialogComponent } from '../documentos-dialog/documentos-dialog.component';
import { Subscription } from 'rxjs';

interface Entrenador {
  id: string;
  nombre: string;
  email: string;
  especialidad: string;
  estado: 'pendiente' | 'activo' | 'rechazado';
  fechaSolicitud: Date;
  avatar: string;
  rating: number;
  clientes: number;
  documentos: boolean;
  entrenadorOriginal?: EntrenadorFirebase;
}

@Component({
  selector: 'app-entrenadores-list',
  templateUrl: './entrenadores-list.component.html',
  styleUrls: ['./entrenadores-list.component.scss']
})
export class EntrenadoresListComponent implements OnInit, OnDestroy {
  entrenadores: Entrenador[] = [];
  filteredEntrenadores: Entrenador[] = [];
  filterEstado = 'todos';
  loading = true;

  stats = {
    total: 0,
    pendientes: 0,
    activos: 0,
    rechazados: 0
  };

  private subscription: Subscription | null = null;

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.loadEntrenadores();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadEntrenadores(): void {
    this.loading = true;
    this.subscription = this.adminFirebase.getEntrenadores().subscribe(entrenadores => {
      this.entrenadores = entrenadores.map(e => this.convertirEntrenador(e));
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    });
  }

  private convertirEntrenador(e: EntrenadorFirebase): Entrenador {
    const fechaSolicitud = e.fechaRegistro instanceof Date
      ? e.fechaRegistro
      : e.fechaRegistro
        ? new Date((e.fechaRegistro as any)?.seconds * 1000)
        : new Date();

    let estado: 'pendiente' | 'activo' | 'rechazado';
    if (!e.verificado) {
      estado = 'pendiente';
    } else if (e.activo) {
      estado = 'activo';
    } else {
      estado = 'rechazado';
    }

    return {
      id: e.id || '',
      nombre: `${e.nombre} ${e.apellidoPaterno}`,
      email: e.email || '',
      especialidad: e.deportes?.join(', ') || 'General',
      estado: estado,
      fechaSolicitud: fechaSolicitud,
      avatar: e.foto || '',
      rating: e.calificacionPromedio || 0,
      clientes: 0,
      documentos: !!e.documentos?.ine || !!e.documentos?.certificacion,
      entrenadorOriginal: e
    };
  }

  calculateStats(): void {
    this.stats.total = this.entrenadores.length;
    this.stats.pendientes = this.entrenadores.filter(e => e.estado === 'pendiente').length;
    this.stats.activos = this.entrenadores.filter(e => e.estado === 'activo').length;
    this.stats.rechazados = this.entrenadores.filter(e => e.estado === 'rechazado').length;
  }

  applyFilters(): void {
    this.filteredEntrenadores = this.entrenadores.filter(e => {
      return this.filterEstado === 'todos' || e.estado === this.filterEstado;
    });
  }

  onFilterChange(estado: string): void {
    this.filterEstado = estado;
    this.applyFilters();
  }

  async aprobar(entrenador: Entrenador): Promise<void> {
    const result = await this.adminFirebase.verificarEntrenador(entrenador.id);
    if (result.success) {
      this.toastr.success(`${entrenador.nombre} ha sido aprobado como entrenador`, 'Éxito');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  async rechazar(entrenador: Entrenador): Promise<void> {
    const result = await this.adminFirebase.desactivarEntrenador(entrenador.id);
    if (result.success) {
      this.toastr.warning(`${entrenador.nombre} ha sido rechazado`, 'Rechazado');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  refrescar(): void {
    this.loadEntrenadores();
    this.toastr.info('Lista de entrenadores actualizada', 'Actualizado');
  }

  verPerfil(entrenador: Entrenador): void {
    // Por ahora abre el diálogo de documentos que también muestra info del perfil
    this.verDocumentos(entrenador);
  }

  verDocumentos(entrenador: Entrenador): void {
    if (!entrenador.entrenadorOriginal) {
      this.toastr.warning('No se pudo cargar la información del entrenador', 'Error');
      return;
    }

    this.dialogService.open(DocumentosDialogComponent, {
      context: {
        entrenador: entrenador.entrenadorOriginal
      },
      closeOnBackdropClick: true,
      closeOnEsc: true
    }).onClose.subscribe((result: any) => {
      if (result?.success) {
        if (result.action === 'aprobado') {
          this.toastr.success(result.message, 'Documentos Aprobados');
        } else if (result.action === 'rechazado') {
          this.toastr.warning(result.message, 'Documentos Rechazados');
        }
      }
    });
  }
}

