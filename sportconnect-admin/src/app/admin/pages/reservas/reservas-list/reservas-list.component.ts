import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { AdminFirebaseService, Reserva as ReservaFirebase } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

interface Reserva {
  id: string;
  cliente: string;
  entrenador: string;
  fecha: Date;
  precio: number;
  estado: string;
}

@Component({
  selector: 'app-reservas-list',
  templateUrl: './reservas-list.component.html',
  styleUrls: ['./reservas-list.component.scss']
})
export class ReservasListComponent implements OnInit, OnDestroy {
  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = [];
  filterEstado = 'todos';
  loading = true;

  stats = {
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    canceladas: 0
  };

  private subscription: Subscription | null = null;

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.loadReservas();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadReservas(): void {
    this.loading = true;
    this.subscription = this.adminFirebase.getReservas().subscribe(reservas => {
      this.reservas = reservas.map(r => this.convertirReserva(r));
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    });
  }

  private convertirReserva(r: ReservaFirebase): Reserva {
    const fecha = r.fecha instanceof Date
      ? r.fecha
      : r.fecha
        ? new Date((r.fecha as any)?.seconds * 1000)
        : new Date();

    return {
      id: r.id || '',
      cliente: r.clienteNombre,
      entrenador: r.entrenadorNombre,
      fecha: fecha,
      precio: r.precio,
      estado: r.estado
    };
  }

  calculateStats(): void {
    this.stats.total = this.reservas.length;
    this.stats.pendientes = this.reservas.filter(r => r.estado === 'PENDIENTE').length;
    this.stats.confirmadas = this.reservas.filter(r => r.estado === 'CONFIRMADA').length;
    this.stats.completadas = this.reservas.filter(r => r.estado === 'COMPLETADA').length;
    this.stats.canceladas = this.reservas.filter(r => r.estado === 'CANCELADA').length;
  }

  applyFilters(): void {
    this.filteredReservas = this.reservas.filter(r => {
      return this.filterEstado === 'todos' || r.estado === this.filterEstado;
    });
  }

  onFilterChange(estado: string): void {
    this.filterEstado = estado;
    this.applyFilters();
  }

  async cancelarReserva(reserva: Reserva): Promise<void> {
    const result = await this.adminFirebase.cancelarReserva(reserva.id);
    if (result.success) {
      this.toastr.success('Reserva cancelada', 'Éxito');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }
}

