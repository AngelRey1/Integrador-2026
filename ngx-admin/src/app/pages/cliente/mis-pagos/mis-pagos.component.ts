import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { ClienteFirebaseService, Pago as PagoFirebase } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

interface Pago {
  id: string;
  numero_transaccion: string;
  fecha: Date;
  concepto: string;
  entrenador: string;
  metodo_pago: string;
  monto: number;
  estado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO' | 'REEMBOLSADO';
  recibo_url?: string;
}

interface EstadisticaPago {
  mes: string;
  monto: number;
}

@Component({
  selector: 'ngx-mis-pagos',
  templateUrl: './mis-pagos.component.html',
  styleUrls: ['./mis-pagos.component.scss']
})
export class MisPagosComponent implements OnInit, OnDestroy {
  loading = true;

  // Stats resumen
  totalGastado = 0;
  pagosPendientes = 0;
  ultimoPago = 0;
  pagosCompletados = 0;

  // Filtros
  filtroBusqueda = '';
  filtroEstado = '';
  filtroMes = '';

  // Datos desde Firebase
  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];

  // Datos para gráfica
  gastosUltimosMeses: EstadisticaPago[] = [];

  // Opciones de filtro
  estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'COMPLETADO', label: 'Completados' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'FALLIDO', label: 'Fallidos' },
    { value: 'REEMBOLSADO', label: 'Reembolsados' }
  ];

  mesesDisponibles = [
    { value: '', label: 'Todos los meses' },
    { value: '1', label: 'Febrero 2026' },
    { value: '0', label: 'Enero 2026' },
    { value: '11', label: 'Diciembre 2025' }
  ];

  private subscription: Subscription | null = null;

  constructor(
    private clienteFirebase: ClienteFirebaseService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.cargarPagos();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarPagos(): void {
    this.loading = true;
    this.subscription = this.clienteFirebase.getMisPagos().subscribe(pagos => {
      this.pagos = pagos.map(p => this.convertirPago(p));
      this.calcularEstadisticas();
      this.aplicarFiltros();
      this.loading = false;
    });
  }

  private convertirPago(p: PagoFirebase): Pago {
    const fecha = p.fecha instanceof Date ? p.fecha : new Date((p.fecha as any)?.seconds * 1000);

    // Mapear estado de Firebase al formato del componente
    let estado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO' | 'REEMBOLSADO';
    switch (p.estado) {
      case 'COMPLETADO': estado = 'COMPLETADO'; break;
      case 'REEMBOLSADO': estado = 'REEMBOLSADO'; break;
      default: estado = 'PENDIENTE';
    }

    return {
      id: p.id || '',
      numero_transaccion: `TXN-${(p.id || '').slice(-8).toUpperCase()}`,
      fecha: fecha,
      concepto: `Sesión con entrenador`,
      entrenador: 'Entrenador', // Se podría enriquecer con datos del entrenador
      metodo_pago: p.metodo === 'tarjeta' ? 'Tarjeta •••• 4242' : p.metodo === 'efectivo' ? 'Efectivo' : 'Transferencia',
      monto: p.monto || 0,
      estado: estado
    };
  }

  calcularEstadisticas(): void {
    // Total gastado (solo completados)
    this.totalGastado = this.pagos
      .filter(p => p.estado === 'COMPLETADO')
      .reduce((sum, p) => sum + p.monto, 0);

    // Pagos pendientes
    this.pagosPendientes = this.pagos
      .filter(p => p.estado === 'PENDIENTE')
      .reduce((sum, p) => sum + p.monto, 0);

    // Último pago
    const ultimoPagoObj = this.pagos
      .filter(p => p.estado === 'COMPLETADO')
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0];
    this.ultimoPago = ultimoPagoObj?.monto || 0;

    // Total de pagos completados
    this.pagosCompletados = this.pagos.filter(p => p.estado === 'COMPLETADO').length;

    // Calcular gastos por mes
    this.calcularGastosMensuales();
  }

  private calcularGastosMensuales(): void {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const gastosPorMes: { [key: string]: number } = {};

    this.pagos
      .filter(p => p.estado === 'COMPLETADO')
      .forEach(p => {
        const key = meses[p.fecha.getMonth()];
        gastosPorMes[key] = (gastosPorMes[key] || 0) + p.monto;
      });

    this.gastosUltimosMeses = Object.entries(gastosPorMes)
      .map(([mes, monto]) => ({ mes, monto }))
      .slice(-3);
  }

  aplicarFiltros(): void {
    let resultado = [...this.pagos];

    // Filtro por búsqueda
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.numero_transaccion.toLowerCase().includes(busqueda) ||
        p.concepto.toLowerCase().includes(busqueda) ||
        p.entrenador.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(p => p.estado === this.filtroEstado);
    }

    // Filtro por mes
    if (this.filtroMes) {
      const mes = parseInt(this.filtroMes);
      resultado = resultado.filter(p => p.fecha.getMonth() === mes);
    }

    this.pagosFiltrados = resultado.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.filtroMes = '';
    this.aplicarFiltros();
  }

  descargarRecibo(pago: Pago): void {
    this.toastr.primary(
      `Descargando recibo ${pago.numero_transaccion}...`,
      'Descarga Iniciada',
      { duration: 3000, icon: 'download-outline' }
    );
  }

  descargarTodos(): void {
    this.toastr.primary(
      'Preparando descarga de todos los recibos...',
      'Descarga Múltiple',
      { duration: 3000, icon: 'download-outline' }
    );
  }

  getEstadoBadgeStatus(estado: string): string {
    const statusMap: Record<string, string> = {
      'COMPLETADO': 'success',
      'PENDIENTE': 'warning',
      'FALLIDO': 'danger',
      'REEMBOLSADO': 'info'
    };
    return statusMap[estado] || 'basic';
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

  getMaxGasto(): number {
    return Math.max(...this.gastosUltimosMeses.map(g => g.monto), 1);
  }

  getBarHeight(monto: number): number {
    const max = this.getMaxGasto();
    return (monto / max) * 100;
  }
}

