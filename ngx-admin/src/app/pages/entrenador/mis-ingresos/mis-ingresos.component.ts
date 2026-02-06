import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntrenadorFirebaseService, EstadisticasMensuales } from '../../../@core/services/entrenador-firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-mis-ingresos',
  templateUrl: './mis-ingresos.component.html',
  styleUrls: ['./mis-ingresos.component.scss']
})
export class MisIngresosComponent implements OnInit, OnDestroy {
  loading = true;
  ingresosTotales = 0;
  comisionPlataforma = 0;
  ingresosNetos = 0;
  transacciones = 0;

  estadisticas: EstadisticasMensuales[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private entrenadorFirebase: EntrenadorFirebaseService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatos(): void {
    this.loading = true;

    // Cargar resumen de ingresos
    const resumenSub = this.entrenadorFirebase.getResumenIngresos().subscribe(resumen => {
      this.ingresosTotales = resumen.ingresosMes;
      this.comisionPlataforma = Math.round(resumen.ingresosMes * 0.1); // 10% comisión
      this.ingresosNetos = resumen.ingresosMes - this.comisionPlataforma;
      this.loading = false;
    });
    this.subscriptions.push(resumenSub);

    // Cargar estadísticas mensuales
    const estadsSub = this.entrenadorFirebase.getEstadisticasMensuales(4).subscribe(estadisticas => {
      this.estadisticas = estadisticas;
      this.transacciones = estadisticas.reduce((sum, e) => sum + e.sesiones, 0);
    });
    this.subscriptions.push(estadsSub);
  }

  getMaxIngreso(): number {
    if (this.estadisticas.length === 0) return 1;
    return Math.max(...this.estadisticas.map(e => e.ingresos), 1);
  }

  getBarHeight(valor: number): number {
    return (valor / this.getMaxIngreso()) * 100;
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }
}

