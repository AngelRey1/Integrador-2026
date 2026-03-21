import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteFirebaseService, Reserva, Entrenador } from '../../../@core/services/cliente-firebase.service';
import { AuthFirebaseService } from '../../../@core/services/auth-firebase.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'ngx-cliente-dashboard',
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteDashboardComponent implements OnInit, OnDestroy {
  loading = true;

  // === DATOS DEL CLIENTE ===
  cliente: any = null;

  // === NUEVA ARQUITECTURA: HUB PERSONAL ===
  vistaActiva: 'proximas' | 'pasadas' = 'proximas';

  // === ESTADÍSTICAS RÁPIDAS DEL HERO ===
  racha = 0;
  logrosDesbloqueados = 0;
  progresoMes = 0;

  // === PRÓXIMA SESIÓN DESTACADA ===
  proximaSesion: any = null;
  tiempoRestante: string = '';
  private timerSubscription: Subscription | null = null;
  private dataSubscriptions: Subscription[] = [];

  // === PROGRESO MENSUAL ===
  totalSesionesMes = 0;
  totalHorasMes = 0;
  tendenciaSesiones = 0;
  caloriasQuemadas = 0;
  entrenadoresUnicos = 0;
  deportesPracticados = 0;
  deportesLista: string[] = [];

  // === HISTORIAL ===
  historialSesiones: any[] = [];

  // === LOGROS ===
  logrosRecientes: any[] = []; // Cargar dinámicamente desde Firebase

  // Próximas sesiones
  proximasSesiones: any[] = [];

  // Filtros de búsqueda
  busquedaRapida = {
    deporte: '',
    fecha: '',
    precioMaximo: null
  };

  constructor(
    private clienteFirebase: ClienteFirebaseService,
    private authFirebase: AuthFirebaseService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosFirebase();
    this.iniciarContador();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    // Limpiar todas las suscripciones
    this.dataSubscriptions.forEach(sub => sub.unsubscribe());
  }

  // === MÉTODOS UTILITARIOS ===

  getGreeting(): string {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  }

  getFechaFormateada(): string {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date().toLocaleDateString('es-ES', opciones);
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
  }

  getDeporteIcon(deporte: string): string {
    if (!deporte) return 'activity';
    const iconMap: { [key: string]: string } = {
      'futbol': 'futbol', 'fútbol': 'futbol', 'soccer': 'futbol',
      'crossfit': 'crossfit', 'pesas': 'crossfit', 'gym': 'crossfit',
      'yoga': 'yoga', 'pilates': 'yoga', 'meditación': 'yoga',
      'natacion': 'natacion', 'natación': 'natacion', 'swimming': 'natacion',
      'running': 'running', 'correr': 'running', 'atletismo': 'running',
      'boxeo': 'boxeo', 'box': 'boxeo', 'boxing': 'boxeo',
      'ciclismo': 'ciclismo', 'cycling': 'ciclismo', 'bicicleta': 'ciclismo',
      'tenis': 'tenis', 'tennis': 'tenis', 'padel': 'tenis'
    };
    return iconMap[deporte.toLowerCase()] || 'activity';
  }

  private iniciarContador(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.proximaSesion?.fecha_hora) {
        this.tiempoRestante = this.calcularTiempoRestante(this.proximaSesion.fecha_hora);
      }
    });
  }

  private calcularTiempoRestante(fecha: Date): string {
    const ahora = new Date();
    const diff = new Date(fecha).getTime() - ahora.getTime();

    if (diff <= 0) return '¡Ahora!';

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos} min`;
  }

  // === ACCIONES DE NAVEGACIÓN ===

  verHistorial(): void {
    this.vistaActiva = 'pasadas';
  }

  verPerfil(): void {
    this.router.navigate(['/pages/cliente/perfil']);
  }

  contactarEntrenador(entrenador: any): void {
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: { entrenador: entrenador.nombre, mensaje: true }
    });
  }

  reagendarSesion(sesion: any): void {
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: {
        reagendar: sesion.id,
        entrenador: sesion.entrenador?.nombre
      }
    });
  }

  // === CARGAR DATOS DESDE FIREBASE (TIEMPO REAL) ===

  cargarDatosFirebase(): void {
    this.loading = true;

    // Obtener datos del perfil del cliente (foto, nombre actualizado, etc.)
    const perfilSub = this.clienteFirebase.getMiPerfil().subscribe(perfil => {
      if (perfil) {
        this.cliente = {
          ...perfil,
          nombre: perfil.nombre || perfil.email?.split('@')[0] || 'Atleta',
          foto_url: perfil.foto || perfil.foto_url || perfil.fotoURL || null
        };
      }
    });
    this.dataSubscriptions.push(perfilSub);

    // Cargar estadísticas del dashboard (tiempo real)
    const statsSub = this.clienteFirebase.getDashboardStats().subscribe(stats => {
      this.totalSesionesMes = stats.reservasCompletadas;
      this.entrenadoresUnicos = stats.entrenadoresFavoritos;
      this.loading = false;
    });
    this.dataSubscriptions.push(statsSub);

    // Cargar próximas reservas (tiempo real)
    const reservasSub = this.clienteFirebase.getReservasProximas().subscribe(reservas => {
      this.proximasSesiones = reservas.map(r => this.formatearReserva(r));

      if (this.proximasSesiones.length > 0) {
        this.proximaSesion = this.proximasSesiones[0];
        this.tiempoRestante = this.calcularTiempoRestante(this.proximaSesion.fecha_hora);
      }
    });
    this.dataSubscriptions.push(reservasSub);

    // Cargar todas las reservas para historial
    const historialSub = this.clienteFirebase.getMisReservas().subscribe(reservas => {
      const ahora = new Date();
      this.historialSesiones = reservas
        .filter(r => new Date(r.fecha as any) < ahora || r.estado === 'COMPLETADA')
        .map(r => this.formatearReserva(r))
        .slice(0, 10);

      // Calcular estadísticas adicionales
      const completadas = reservas.filter(r => r.estado === 'COMPLETADA');
      this.totalSesionesMes = completadas.length;
      this.totalHorasMes = Math.round(completadas.reduce((sum, r) => sum + (r.duracion || 60), 0) / 60);
      this.caloriasQuemadas = this.totalHorasMes * 200;

      // Deportes únicos
      const deportes = new Set<string>();
      reservas.forEach(r => {
        if ((r as any).deporte) deportes.add((r as any).deporte);
      });
      this.deportesLista = Array.from(deportes);
      this.deportesPracticados = deportes.size;
    });
    this.dataSubscriptions.push(historialSub);

    // Cargar logros desbloqueados en tiempo real (DINÁMICAMENTE)
    const logrosSub = this.clienteFirebase
      .getLogrosDesbloqueados()
      .subscribe(logros => {
        console.log('🏆 Logros del usuario:', logros);
        this.logrosRecientes = logros;
        this.logrosDesbloqueados = logros.length;
      });
    this.dataSubscriptions.push(logrosSub);
  }

  private formatearReserva(reserva: Reserva): any {
    return {
      id: reserva.id,
      fecha_hora: reserva.fecha instanceof Date ? reserva.fecha : new Date((reserva.fecha as any)?.seconds * 1000),
      entrenador: {
        id: reserva.entrenadorId,
        nombre: reserva.entrenadorNombre,
        foto: reserva.entrenadorFoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(reserva.entrenadorNombre || 'E') + '&background=00D09C&color=fff&size=100'
      },
      deporte: (reserva as any).deporte || 'General',
      duracion: reserva.duracion || 60,
      estado: reserva.estado,
      estadoPago: reserva.estadoPago || ((reserva.estado === 'CONFIRMADA' || reserva.estado === 'COMPLETADA') ? 'COMPLETADO' : 'PENDIENTE'),
      ubicacion: reserva.ubicacion || reserva.modalidad || 'No especificada'
    };
  }

  buscarEntrenadores() {
    this.router.navigate(['/entrenadores']);
  }

  verSesion(sesion: any) {
    this.router.navigate(['/pages/cliente/mis-reservas'], {
      queryParams: { sesion: sesion.id }
    });
  }

  async cancelarSesion(sesion: any) {
    if (confirm('¿Estás seguro de que deseas cancelar esta sesión?')) {
      const result = await this.clienteFirebase.cancelarReserva(sesion.id, 'Cancelado por el cliente');
      if (result.success) {
        // La UI se actualizará automáticamente por la suscripción en tiempo real
        console.log('Reserva cancelada exitosamente');
      } else {
        alert('Error al cancelar: ' + result.message);
      }
    }
  }

  agendarConEntrenador(entrenador: any) {
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: {
        entrenador: entrenador.id || entrenador.nombre
      }
    });
  }

  getEstadoBadgeStatus(estado: string): string {
    const statusMap: { [key: string]: string } = {
      'CONFIRMADA': 'success',
      'PENDIENTE': 'warning',
      'COMPLETADA': 'info',
      'CANCELADA': 'danger'
    };
    return statusMap[estado] || 'basic';
  }

  getEstadoPagoStatusClass(estado: string | undefined): string {
    if (estado === 'COMPLETADO' || estado === 'NO_REQUERIDO') return 'status-completada';
    if (estado === 'REEMBOLSADO') return 'status-cancelada';
    return 'status-pendiente';
  }

  /**
   * Convierte cualquier formato de fecha a Date nativo
   * Soporta: Date, Firestore Timestamp, string ISO
   */
  toDate(fecha: any): Date {
    if (!fecha) return new Date();
    if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha;
    if (typeof fecha === 'object' && 'seconds' in fecha) {
      return new Date(fecha.seconds * 1000);
    }
    if (typeof fecha === 'string') {
      const parsed = new Date(fecha);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }
}

