import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminFirebaseService } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

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
}
