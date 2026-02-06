import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { AdminFirebaseService, Deporte as DeporteFirebase } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

interface Deporte {
  id: string;
  nombre: string;
  icono: string;
  activo: boolean;
}

@Component({
  selector: 'app-deportes-list',
  templateUrl: './deportes-list.component.html',
  styleUrls: ['./deportes-list.component.scss']
})
export class DeportesListComponent implements OnInit, OnDestroy {
  deportes: Deporte[] = [];
  loading = true;
  nuevoDeporte = { nombre: '', icono: 'activity-outline' };
  mostrarFormulario = false;

  stats = {
    total: 0,
    activos: 0
  };

  private subscription: Subscription | null = null;

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.loadDeportes();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadDeportes(): void {
    this.loading = true;
    this.subscription = this.adminFirebase.getDeportes().subscribe(deportes => {
      this.deportes = deportes.map(d => ({
        id: d.id || '',
        nombre: d.nombre,
        icono: d.icono,
        activo: d.activo
      }));
      this.calculateStats();
      this.loading = false;
    });
  }

  calculateStats(): void {
    this.stats.total = this.deportes.length;
    this.stats.activos = this.deportes.filter(d => d.activo).length;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.nuevoDeporte = { nombre: '', icono: 'activity-outline' };
    }
  }

  async crearDeporte(): Promise<void> {
    if (!this.nuevoDeporte.nombre.trim()) {
      this.toastr.warning('Ingresa un nombre para el deporte', 'Atención');
      return;
    }

    const result = await this.adminFirebase.crearDeporte({
      nombre: this.nuevoDeporte.nombre,
      icono: this.nuevoDeporte.icono,
      activo: true
    });

    if (result.success) {
      this.toastr.success('Deporte creado', 'Éxito');
      this.toggleFormulario();
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  async toggleActivo(deporte: Deporte): Promise<void> {
    const result = await this.adminFirebase.actualizarDeporte(deporte.id, {
      activo: !deporte.activo
    });

    if (result.success) {
      const estado = !deporte.activo ? 'activado' : 'desactivado';
      this.toastr.info(`Deporte ${estado}`, 'Actualizado');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  async eliminarDeporte(deporte: Deporte): Promise<void> {
    if (confirm(`¿Eliminar el deporte ${deporte.nombre}?`)) {
      const result = await this.adminFirebase.eliminarDeporte(deporte.id);
      if (result.success) {
        this.toastr.success('Deporte eliminado', 'Éxito');
      } else {
        this.toastr.danger(result.message, 'Error');
      }
    }
  }
}

