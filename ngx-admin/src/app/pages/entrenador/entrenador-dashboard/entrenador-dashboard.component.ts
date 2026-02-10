import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EntrenadorFirebaseService, EstadisticasMensuales, ClienteResumen } from '../../../@core/services/entrenador-firebase.service';
import { Reserva } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

interface Sesion {
  id: string;
  cliente: {
    id?: string;
    nombre: string;
    avatar: string;
  };
  deporte: string;
  fecha: Date;
  hora: string;
  duracion: number;
  modalidad: 'presencial' | 'online';
  estado: 'CONFIRMADA' | 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  ubicacion?: string;
}

@Component({
  selector: 'ngx-entrenador-dashboard',
  templateUrl: './entrenador-dashboard.component.html',
  styleUrls: ['./entrenador-dashboard.component.scss']
})
export class EntrenadorDashboardComponent implements OnInit, OnDestroy {
  loading = true;

  // Métricas principales
  clientesActivos = 0;
  clientesNuevosMes = 0;
  clientesMesAnterior = 0;
  sesionesMes = 0;
  sesionesMesAnterior = 0;
  ingresosMes = 0;
  ingresosMesAnterior = 0;
  ingresosSemanales = 0;
  calificacionPromedio = 0;
  tasaAsistencia = 0;
  totalResenas = 0;

  // Próximas sesiones
  proximasSesiones: Sesion[] = [];

  // Sesiones de hoy
  sesionesHoy: Sesion[] = [];

  // Últimos clientes
  ultimosClientes: ClienteResumen[] = [];

  // Estadísticas mensuales
  estadisticasMensuales: EstadisticasMensuales[] = [];

  // Notificaciones
  notificacionesPendientes = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private entrenadorFirebase: EntrenadorFirebaseService
  ) { }

  ngOnInit(): void {
    this.cargarDatosFirebase();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatosFirebase(): void {
    this.loading = true;

    // Cargar estadísticas del dashboard con tendencias
    const statsSub = this.entrenadorFirebase.getDashboardStats().subscribe(stats => {
      this.clientesActivos = stats.clientesActivos;
      this.clientesNuevosMes = stats.clientesNuevosMes;
      this.clientesMesAnterior = stats.clientesMesAnterior;
      this.sesionesMes = stats.sesionesMes;
      this.sesionesMesAnterior = stats.sesionesMesAnterior;
      this.ingresosMes = stats.ingresosMes;
      this.ingresosMesAnterior = stats.ingresosMesAnterior;
      this.calificacionPromedio = stats.calificacion;
      this.totalResenas = stats.totalResenas;
      this.tasaAsistencia = stats.tasaAsistencia;
      this.loading = false;
    });
    this.subscriptions.push(statsSub);

    // Cargar resumen de ingresos semanales
    const ingresosSub = this.entrenadorFirebase.getResumenIngresos().subscribe(resumen => {
      this.ingresosSemanales = resumen.ingresosSemanales;
    });
    this.subscriptions.push(ingresosSub);

    // Cargar sesiones de hoy
    const hoySub = this.entrenadorFirebase.getSesionesHoy().subscribe(reservas => {
      this.sesionesHoy = reservas.map(r => this.convertirReservaASesion(r));
    });
    this.subscriptions.push(hoySub);

    // Cargar próximas sesiones
    const proximasSub = this.entrenadorFirebase.getProximasSesiones(6).subscribe(reservas => {
      this.proximasSesiones = reservas.map(r => this.convertirReservaASesion(r));
    });
    this.subscriptions.push(proximasSub);

    // Cargar clientes
    const clientesSub = this.entrenadorFirebase.getMisClientes().subscribe(clientes => {
      this.ultimosClientes = clientes.slice(0, 4);
    });
    this.subscriptions.push(clientesSub);

    // Cargar estadísticas mensuales
    const estadsSub = this.entrenadorFirebase.getEstadisticasMensuales(4).subscribe(estadisticas => {
      this.estadisticasMensuales = estadisticas;
    });
    this.subscriptions.push(estadsSub);

    // Cargar reservas pendientes como notificaciones
    const pendientesSub = this.entrenadorFirebase.getMisReservas('PENDIENTE').subscribe(reservas => {
      this.notificacionesPendientes = reservas.length;
    });
    this.subscriptions.push(pendientesSub);
  }

  private convertirReservaASesion(r: Reserva): Sesion {
    const fecha = r.fecha instanceof Date ? r.fecha : new Date((r.fecha as any)?.seconds * 1000);

    return {
      id: r.id || '',
      cliente: {
        id: r.clienteId,
        nombre: r.clienteNombre,
        avatar: 'assets/images/avatar-default.png'
      },
      deporte: (r as any).deporte || 'General',
      fecha: fecha,
      hora: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      duracion: r.duracion || 60,
      modalidad: r.modalidad || 'presencial',
      estado: r.estado as any,
      ubicacion: r.ubicacion
    };
  }

  verCliente(sesion: Sesion): void {
    this.router.navigate(['/pages/entrenador/mis-clientes'], {
      queryParams: { cliente: sesion.cliente.id }
    });
  }

  irACalendario(): void {
    this.router.navigate(['/pages/entrenador/calendario']);
  }

  irAClases(): void {
    this.router.navigate(['/pages/entrenador/gestion-clases']);
  }

  irAIngresos(): void {
    this.router.navigate(['/pages/entrenador/mis-ingresos']);
  }

  verSesion(sesion: Sesion): void {
    this.router.navigate(['/pages/entrenador/calendario'], {
      queryParams: { sesion: sesion.id }
    });
  }

  async completarSesion(sesion: Sesion): Promise<void> {
    const result = await this.entrenadorFirebase.completarReserva(sesion.id);
    if (result.success) {
      // Actualizar lista local
      sesion.estado = 'COMPLETADA';
    }
  }

  // Métodos para calcular tendencias
  getTendenciaClientes(): { valor: string; tipo: 'positive' | 'negative' | 'neutral' } {
    const diff = this.clientesNuevosMes;
    if (diff > 0) return { valor: `+${diff} este mes`, tipo: 'positive' };
    if (diff === 0 && this.clientesMesAnterior === 0) return { valor: 'Sin cambios', tipo: 'neutral' };
    return { valor: `${diff} este mes`, tipo: diff < 0 ? 'negative' : 'neutral' };
  }

  getTendenciaSesiones(): { valor: string; tipo: 'positive' | 'negative' | 'neutral' } {
    const diff = this.sesionesMes - this.sesionesMesAnterior;
    if (diff > 0) return { valor: `+${diff} vs mes anterior`, tipo: 'positive' };
    if (diff === 0) return { valor: 'Sin cambios', tipo: 'neutral' };
    return { valor: `${diff} vs mes anterior`, tipo: 'negative' };
  }

  getTendenciaIngresos(): { valor: string; tipo: 'positive' | 'negative' | 'neutral' } {
    if (this.ingresosMesAnterior === 0) {
      if (this.ingresosMes > 0) return { valor: '+100%', tipo: 'positive' };
      return { valor: 'Sin datos previos', tipo: 'neutral' };
    }
    const porcentaje = Math.round(((this.ingresosMes - this.ingresosMesAnterior) / this.ingresosMesAnterior) * 100);
    if (porcentaje > 0) return { valor: `+${porcentaje}% vs mes anterior`, tipo: 'positive' };
    if (porcentaje === 0) return { valor: 'Sin cambios', tipo: 'neutral' };
    return { valor: `${porcentaje}% vs mes anterior`, tipo: 'negative' };
  }

  getEstadoBadgeStatus(estado: string): string {
    const statusMap: Record<string, string> = {
      'CONFIRMADA': 'success',
      'PENDIENTE': 'warning',
      'COMPLETADA': 'info',
      'CANCELADA': 'danger'
    };
    return statusMap[estado] || 'basic';
  }

  formatearFecha(fecha: Date): string {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    if (fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()) {
      return 'Hoy';
    }

    if (fecha.getDate() === manana.getDate() &&
      fecha.getMonth() === manana.getMonth() &&
      fecha.getFullYear() === manana.getFullYear()) {
      return 'Mañana';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short'
    }).format(fecha);
  }

  getMaxEstadistica(tipo: 'sesiones' | 'ingresos'): number {
    if (this.estadisticasMensuales.length === 0) return 1;
    return Math.max(...this.estadisticasMensuales.map(e => tipo === 'sesiones' ? e.sesiones : e.ingresos), 1);
  }

  getBarHeight(valor: number, tipo: 'sesiones' | 'ingresos'): number {
    const max = this.getMaxEstadistica(tipo);
    return (valor / max) * 100;
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }
}

