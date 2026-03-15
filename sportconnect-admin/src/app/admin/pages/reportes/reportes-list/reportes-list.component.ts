import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminFirebaseService } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

interface ReporteMensual {
  totalReservas: number;
  reservasCompletadas: number;
  reservasCanceladas: number;
  ingresosTotales: number;
  comisionesPlatforma: number;
}

@Component({
  selector: 'app-reportes-list',
  templateUrl: './reportes-list.component.html',
  styleUrls: ['./reportes-list.component.scss']
})
export class ReportesListComponent implements OnInit, OnDestroy {
  loading = true;
  selectedYear: number;
  selectedMonth: number;
  reporte: ReporteMensual | null = null;
  
  years: number[] = [];
  months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' }
  ];

  private subscription: Subscription | null = null;

  constructor(private adminFirebase: AdminFirebaseService) {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth();
    
    // Generar años disponibles (3 años atrás hasta el actual)
    for (let y = now.getFullYear() - 3; y <= now.getFullYear(); y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.loadReporte();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadReporte(): void {
    this.loading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    this.subscription = this.adminFirebase.getReporteMensual(this.selectedYear, this.selectedMonth)
      .subscribe(reporte => {
        this.reporte = reporte;
        this.loading = false;
      });
  }

  onPeriodChange(): void {
    this.loadReporte();
  }

  getSelectedMonthName(): string {
    const month = this.months.find(m => m.value === this.selectedMonth);
    return month ? month.label : '';
  }

  get tasaCompletadas(): number {
    if (!this.reporte || this.reporte.totalReservas === 0) return 0;
    return Math.round((this.reporte.reservasCompletadas / this.reporte.totalReservas) * 100);
  }

  get tasaCanceladas(): number {
    if (!this.reporte || this.reporte.totalReservas === 0) return 0;
    return Math.round((this.reporte.reservasCanceladas / this.reporte.totalReservas) * 100);
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }

  /**
   * Exportar reporte a CSV
   */
  exportarCSV(): void {
    if (!this.reporte) {
      alert('No hay datos de reporte para exportar');
      return;
    }

    const monthName = this.getSelectedMonthName();
    const filename = `Reporte_${monthName}_${this.selectedYear}.csv`;

    // Preparar datos para CSV
    const data = [
      ['REPORTE MENSUAL SPORTCONNECT'],
      [],
      [`Período: ${monthName} ${this.selectedYear}`],
      [],
      ['RESUMEN DE RESERVAS'],
      ['Total de Reservas', this.reporte.totalReservas],
      ['Reservas Completadas', this.reporte.reservasCompletadas, `(${this.tasaCompletadas}%)`],
      ['Reservas Canceladas', this.reporte.reservasCanceladas, `(${this.tasaCanceladas}%)`],
      [],
      ['INGRESOS'],
      ['Ingresos Totales', `$${this.reporte.ingresosTotales.toFixed(2)}`],
      ['Comisión de Plataforma', `$${this.reporte.comisionesPlatforma.toFixed(2)}`],
      [],
      [`Generado: ${new Date().toLocaleString('es-MX')}`]
    ];

    // Crear worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];

    // Crear workbook y agregar worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // Descargar archivo
    XLSX.writeFile(wb, filename);
  }

  /**
   * Exportar reporte a JSON (formato estructurado)
   */
  exportarJSON(): void {
    if (!this.reporte) {
      alert('No hay datos de reporte para exportar');
      return;
    }

    const monthName = this.getSelectedMonthName();
    const filename = `Reporte_${monthName}_${this.selectedYear}.json`;

    const reporteJSON = {
      periodo: {
        mes: this.selectedMonth + 1,
        año: this.selectedYear,
        nombreMes: monthName
      },
      fecha_generacion: new Date().toISOString(),
      resumenReservas: {
        total: this.reporte.totalReservas,
        completadas: this.reporte.reservasCompletadas,
        canceladas: this.reporte.reservasCanceladas,
        tasaCompletadas: `${this.tasaCompletadas}%`,
        tasaCanceladas: `${this.tasaCanceladas}%`
      },
      ingresos: {
        total: this.reporte.ingresosTotales,
        comisiones: this.reporte.comisionesPlatforma
      }
    };

    // Crear blob y descargar
    const dataStr = JSON.stringify(reporteJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Copiar reporte a portapapeles
   */
  copiarAlPortapapeles(): void {
    if (!this.reporte) {
      alert('No hay datos de reporte para copiar');
      return;
    }

    const monthName = this.getSelectedMonthName();
    const texto = `REPORTE MENSUAL SPORTCONNECT
Período: ${monthName} ${this.selectedYear}

RESUMEN DE RESERVAS
Total de Reservas: ${this.reporte.totalReservas}
Reservas Completadas: ${this.reporte.reservasCompletadas} (${this.tasaCompletadas}%)
Reservas Canceladas: ${this.reporte.reservasCanceladas} (${this.tasaCanceladas}%)

INGRESOS
Ingresos Totales: $${this.reporte.ingresosTotales.toFixed(2)}
Comisión de Plataforma: $${this.reporte.comisionesPlatforma.toFixed(2)}

Generado: ${new Date().toLocaleString('es-MX')}`;

    navigator.clipboard.writeText(texto).then(() => {
      alert('Reporte copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar al portapapeles');
    });
  }
}
