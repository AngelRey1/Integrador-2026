import { Component, OnInit } from '@angular/core';

interface Pago {
  id: number;
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
export class MisPagosComponent implements OnInit {
  // Stats resumen
  totalGastado = 0;
  pagosPendientes = 0;
  ultimoPago = 0;
  pagosCompletados = 0;

  // Filtros
  filtroBusqueda = '';
  filtroEstado = '';
  filtroMes = '';

  // Datos (precios en MXN - pesos mexicanos)
  pagos: Pago[] = [
    {
      id: 1,
      numero_transaccion: 'TXN-2026-001',
      fecha: new Date(2026, 1, 12),
      concepto: 'Sesión de Yoga - 1 hora',
      entrenador: 'Ana Pérez García',
      metodo_pago: 'Visa •••• 4242',
      monto: 450,
      estado: 'COMPLETADO',
      recibo_url: '#'
    },
    {
      id: 2,
      numero_transaccion: 'TXN-2026-002',
      fecha: new Date(2026, 1, 10),
      concepto: 'Sesión de CrossFit - 1.5 horas',
      entrenador: 'Carlos Ruiz López',
      metodo_pago: 'Mastercard •••• 5555',
      monto: 675,
      estado: 'COMPLETADO',
      recibo_url: '#'
    },
    {
      id: 3,
      numero_transaccion: 'TXN-2026-003',
      fecha: new Date(2026, 1, 8),
      concepto: 'Sesión de Running - 1 hora',
      entrenador: 'María González',
      metodo_pago: 'PayPal',
      monto: 350,
      estado: 'COMPLETADO',
      recibo_url: '#'
    },
    {
      id: 4,
      numero_transaccion: 'TXN-2026-004',
      fecha: new Date(2026, 1, 15),
      concepto: 'Sesión de Boxeo - 1 hora',
      entrenador: 'David Martínez',
      metodo_pago: 'Visa •••• 4242',
      monto: 500,
      estado: 'PENDIENTE'
    },
    {
      id: 5,
      numero_transaccion: 'TXN-2026-005',
      fecha: new Date(2026, 0, 28),
      concepto: 'Sesión de Pilates - 1 hora',
      entrenador: 'Ana Pérez García',
      metodo_pago: 'Visa •••• 4242',
      monto: 450,
      estado: 'COMPLETADO',
      recibo_url: '#'
    },
    {
      id: 6,
      numero_transaccion: 'TXN-2026-006',
      fecha: new Date(2026, 0, 25),
      concepto: 'Sesión de Natación - 1 hora',
      entrenador: 'Laura Sánchez',
      metodo_pago: 'Mastercard •••• 5555',
      monto: 380,
      estado: 'COMPLETADO',
      recibo_url: '#'
    },
    {
      id: 7,
      numero_transaccion: 'TXN-2026-007',
      fecha: new Date(2026, 0, 20),
      concepto: 'Sesión de Ciclismo - 2 horas',
      entrenador: 'Javier Torres',
      metodo_pago: 'PayPal',
      monto: 800,
      estado: 'COMPLETADO',
      recibo_url: '#'
    },
    {
      id: 8,
      numero_transaccion: 'TXN-2025-008',
      fecha: new Date(2025, 11, 15),
      concepto: 'Sesión de Yoga - 1 hora',
      entrenador: 'Ana Pérez García',
      metodo_pago: 'Visa •••• 4242',
      monto: 450,
      estado: 'REEMBOLSADO'
    }
  ];

  pagosFiltrados: Pago[] = [];

  // Datos para gráfica (en MXN)
  gastosUltimosMeses: EstadisticaPago[] = [
    { mes: 'Dic', monto: 1800 },
    { mes: 'Ene', monto: 2430 },
    { mes: 'Feb', monto: 1975 }
  ];

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

  constructor() {}

  ngOnInit(): void {
    this.calcularEstadisticas();
    this.aplicarFiltros();
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
    console.log('Descargar recibo:', pago);
    // TODO: Implementar descarga de PDF
  }

  descargarTodos(): void {
    console.log('Descargar todos los recibos');
    // TODO: Implementar descarga masiva
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
    return Math.max(...this.gastosUltimosMeses.map(g => g.monto));
  }

  getBarHeight(monto: number): number {
    const max = this.getMaxGasto();
    return (monto / max) * 100;
  }
}
