import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { AdminFirebaseService, Pago as PagoFirebase } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

interface Pago {
  id: string;
  monto: number;
  comision: number;
  montoEntrenador: number;
  estado: string;
  fecha: Date;
  clienteId: string;
  entrenadorId: string;
}

@Component({
  selector: 'app-pagos-list',
  templateUrl: './pagos-list.component.html',
  styleUrls: ['./pagos-list.component.scss']
})
export class PagosListComponent implements OnInit, OnDestroy {
  pagos: Pago[] = [];
  filteredPagos: Pago[] = [];
  filterEstado = 'todos';
  loading = true;

  stats = {
    total: 0,
    completados: 0,
    pendientes: 0,
    reembolsados: 0,
    ingresosMes: 0,
    comisionesMes: 0
  };

  private subscription: Subscription | null = null;

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.loadPagos();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPagos(): void {
    this.loading = true;
    this.subscription = this.adminFirebase.getPagos().subscribe(pagos => {
      this.pagos = pagos.map(p => this.convertirPago(p));
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    });
  }

  private convertirPago(p: PagoFirebase): Pago {
    const fecha = p.fecha instanceof Date
      ? p.fecha
      : p.fecha
        ? new Date((p.fecha as any)?.seconds * 1000)
        : new Date();

    return {
      id: p.id || '',
      monto: p.monto,
      comision: p.comision,
      montoEntrenador: p.montoEntrenador,
      estado: p.estado,
      fecha: fecha,
      clienteId: p.clienteId,
      entrenadorId: p.entrenadorId
    };
  }

  calculateStats(): void {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    this.stats.total = this.pagos.length;
    this.stats.completados = this.pagos.filter(p => p.estado === 'COMPLETADO').length;
    this.stats.pendientes = this.pagos.filter(p => p.estado === 'PENDIENTE').length;
    this.stats.reembolsados = this.pagos.filter(p => p.estado === 'REEMBOLSADO').length;

    const pagosMes = this.pagos.filter(p => p.fecha >= inicioMes && p.estado === 'COMPLETADO');
    this.stats.ingresosMes = pagosMes.reduce((sum, p) => sum + p.monto, 0);
    this.stats.comisionesMes = pagosMes.reduce((sum, p) => sum + p.comision, 0);
  }

  applyFilters(): void {
    this.filteredPagos = this.pagos.filter(p => {
      return this.filterEstado === 'todos' || p.estado === this.filterEstado;
    });
  }

  onFilterChange(estado: string): void {
    this.filterEstado = estado;
    this.applyFilters();
  }

  async reembolsarPago(pago: Pago): Promise<void> {
    const result = await this.adminFirebase.reembolsarPago(pago.id);
    if (result.success) {
      this.toastr.success('Pago reembolsado', 'Éxito');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }
}

