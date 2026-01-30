import { Component } from '@angular/core';

@Component({
  selector: 'ngx-mis-ingresos',
  templateUrl: './mis-ingresos.component.html',
  styleUrls: ['./mis-ingresos.component.scss']
})
export class MisIngresosComponent {
  ingresosTotales = 1890;
  comisionPlataforma = 189;
  ingresosNetos = 1701;
  transacciones = 42;

  estadisticas = [
    { mes: 'Ago', ingresos: 1710 },
    { mes: 'Sep', ingresos: 1845 },
    { mes: 'Oct', ingresos: 2025 },
    { mes: 'Nov', ingresos: 1890 }
  ];

  getMaxIngreso(): number {
    return Math.max(...this.estadisticas.map(e => e.ingresos));
  }

  getBarHeight(valor: number): number {
    return (valor / this.getMaxIngreso()) * 100;
  }
}
