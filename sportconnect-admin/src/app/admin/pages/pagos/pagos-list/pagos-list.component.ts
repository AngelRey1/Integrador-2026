import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { AdminFirebaseService, Pago as PagoFirebase } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';

interface Pago {
  id: string;
  monto: number;
  comision: number;
  montoEntrenador: number;
  estado: string;
  fecha: Date;
  clienteId: string;
  entrenadorId: string;
  // Campos para OXXO
  stripePaymentIntentId?: string;
  metodoPago?: string;
  oxxoReferencia?: string;
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
  isProduction = environment.production;

  stats = {
    total: 0,
    completados: 0,
    pendientes: 0,
    reembolsados: 0,
    ingresosMes: 0,
    comisionesMes: 0
  };

  private subscription: Subscription | null = null;
  simulandoPago: { [key: string]: boolean } = {};

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService,
    private http: HttpClient
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

    const monto = p.monto || 0;
    const comision = p.comision ?? ((p as any).comisionPlataforma) ?? (monto * 0.10);
    const montoEntrenador = p.montoEntrenador ?? (monto - comision);
    return {
      id: p.id || '',
      monto: monto,
      comision: comision,
      montoEntrenador: montoEntrenador,
      estado: p.estado,
      fecha: fecha,
      clienteId: p.clienteId,
      entrenadorId: p.entrenadorId,
      stripePaymentIntentId: p.stripePaymentIntentId,
      metodoPago: p.metodoPago || (p as any).metodo,
      oxxoReferencia: p.oxxoReferencia
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

  /**
   * Simular pago OXXO (solo modo TEST)
   * Abre el dashboard de Stripe para el PaymentIntent
   */
  simularPagoOxxo(pago: Pago): void {
    if (this.isProduction) {
      this.toastr.warning('La simulacion de pagos solo esta disponible en modo TEST', 'No disponible en produccion');
      this.abrirEnStripe(pago);
      return;
    }

    if (!pago.stripePaymentIntentId) {
      this.toastr.warning('Este pago no tiene un PaymentIntent de Stripe asociado', 'Información');
      // Abrir el dashboard de Stripe para ver todos los pagos
      window.open(this.getStripeDashboardUrl(), '_blank');
      return;
    }

    this.simulandoPago[pago.id] = true;

    // Llamar al endpoint para simular
    this.http.post<any>(`${environment.stripe.functionsUrl}/api/simulate-oxxo-payment`, {
      paymentIntentId: pago.stripePaymentIntentId
    }).subscribe({
      next: (response) => {
        this.simulandoPago[pago.id] = false;
        
        if (response.success) {
          this.toastr.success(response.message, 'Simulación');
          
          // Si hay instrucciones, mostrar modal o abrir Stripe
          if (response.instructions) {
            this.toastr.info('Abriendo dashboard de Stripe...', 'Instrucciones');
            window.open(this.getStripeDashboardUrl(pago.stripePaymentIntentId), '_blank');
          }
        } else {
          this.toastr.warning(response.message, 'Advertencia');
        }
      },
      error: (error) => {
        this.simulandoPago[pago.id] = false;
        console.error('Error simulando pago:', error);
        this.toastr.danger(error.error?.error || 'Error al simular el pago', 'Error');
      }
    });
  }

  /**
   * Abrir dashboard de Stripe para ver el pago
   */
  abrirEnStripe(pago: Pago): void {
    if (pago.stripePaymentIntentId) {
      window.open(this.getStripeDashboardUrl(pago.stripePaymentIntentId), '_blank');
    } else {
      window.open(this.getStripeDashboardUrl(), '_blank');
    }
  }

  private getStripeDashboardUrl(paymentIntentId?: string): string {
    const baseUrl = this.isProduction ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test';
    return paymentIntentId ? `${baseUrl}/payments/${paymentIntentId}` : `${baseUrl}/payments`;
  }

  /**
   * Marcar pago como completado en Firestore (demo)
   */
  async marcarComoCompletado(pago: Pago): Promise<void> {
    const result = await this.adminFirebase.completarPago(pago.id);
    if (result.success) {
      this.toastr.success('Pago marcado como completado', 'Éxito');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }
}

