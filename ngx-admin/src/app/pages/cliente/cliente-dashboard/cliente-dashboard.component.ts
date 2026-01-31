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
  logrosRecientes: any[] = [
    { nombre: 'Primera Sesión', tipo: 'bronce', icono: 'award' },
    { nombre: 'Racha de 7 días', tipo: 'plata', icono: 'fire' },
    { nombre: 'Explorador', tipo: 'oro', icono: 'trophy' }
  ];

  // Próximas sesiones
  proximasSesiones: any[] = [];

  // Entrenadores favoritos
  entrenadoresFavoritos: any[] = [];

  // Filtros de búsqueda
  busquedaRapida = {
    deporte: '',
    fecha: '',
    precioMaximo: null
  };

  constructor(
    private clienteFirebase: ClienteFirebaseService,
    private authFirebase: AuthFirebaseService,
    private router: Router
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
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
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

    // Obtener datos del usuario actual
    const userSub = this.authFirebase.getCurrentUser().subscribe(user => {
      if (user) {
        this.cliente = user;
      }
    });
    this.dataSubscriptions.push(userSub);

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

    // Cargar entrenadores (para favoritos)
    const entrenadorsSub = this.clienteFirebase.getEntrenadores().subscribe(entrenadores => {
      this.entrenadoresFavoritos = entrenadores.slice(0, 3).map(e => ({
        id: e.id,
        nombre_completo: `${e.nombre} ${e.apellidoPaterno}`,
        especialidad: e.deportes?.join(', ') || 'General',
        calificacion: e.calificacionPromedio || 0,
        total_resenas: e.totalReviews || 0,
        tarifa_por_hora: e.precio || 0,
        foto_url: e.foto || 'assets/images/avatar-default.png'
      }));
    });
    this.dataSubscriptions.push(entrenadorsSub);
  }

  private formatearReserva(reserva: Reserva): any {
    return {
      id: reserva.id,
      fecha_hora: reserva.fecha instanceof Date ? reserva.fecha : new Date((reserva.fecha as any)?.seconds * 1000),
      entrenador: {
        id: reserva.entrenadorId,
        nombre: reserva.entrenadorNombre,
        foto: 'assets/images/avatar-default.png'
      },
      deporte: (reserva as any).deporte || 'General',
      duracion: reserva.duracion || 60,
      estado: reserva.estado,
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
}

