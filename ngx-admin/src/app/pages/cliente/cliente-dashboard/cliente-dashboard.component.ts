import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from '../../../@core/services/cliente.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, interval, Subscription } from 'rxjs';

@Component({
  selector: 'ngx-cliente-dashboard',
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  
  // === DATOS DEL CLIENTE ===
  cliente: any = null;
  
  // === NUEVA ARQUITECTURA: HUB PERSONAL ===
  vistaActiva: 'proximas' | 'pasadas' = 'proximas';
  
  // === ESTADÍSTICAS RÁPIDAS DEL HERO ===
  racha = 7;
  logrosDesbloqueados = 3;
  progresoMes = 15;
  
  // === PRÓXIMA SESIÓN DESTACADA ===
  proximaSesion: any = null;
  tiempoRestante: string = '';
  private timerSubscription: Subscription | null = null;
  
  // === PROGRESO MENSUAL ===
  totalSesionesMes = 8;
  totalHorasMes = 12;
  tendenciaSesiones = 20;
  caloriasQuemadas = 2400;
  entrenadoresUnicos = 3;
  deportesPracticados = 4;
  deportesLista: string[] = ['Yoga', 'CrossFit', 'Running', 'Natación'];
  
  // === HISTORIAL ===
  historialSesiones: any[] = [];
  
  // === LOGROS ===
  logrosRecientes: any[] = [
    { nombre: 'Primera Sesión', tipo: 'bronce', icono: 'award' },
    { nombre: 'Racha de 7 días', tipo: 'plata', icono: 'fire' },
    { nombre: 'Explorador', tipo: 'oro', icono: 'trophy' }
  ];

  // Próximas sesiones
  proximasSesiones = [
    {
      id: 1,
      fecha_hora: new Date('2026-02-01T10:00:00'),
      entrenador: {
        nombre: 'Ana Pérez',
        foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
      },
      deporte: 'Yoga',
      duracion: 60,
      estado: 'CONFIRMADA',
      ubicacion: 'Gym Centro, Mérida'
    },
    {
      id: 2,
      fecha_hora: new Date('2026-02-05T16:00:00'),
      entrenador: {
        nombre: 'Carlos Ruiz',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
      },
      deporte: 'CrossFit',
      duracion: 90,
      estado: 'PENDIENTE',
      ubicacion: 'Online'
    }
  ];

  // Entrenadores favoritos
  entrenadoresFavoritos = [
    {
      id: 1,
      nombre_completo: 'Ana Pérez',
      especialidad: 'Yoga & Pilates',
      calificacion: 4.8,
      total_resenas: 45,
      tarifa_por_hora: 450,
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre_completo: 'Carlos Ruiz',
      especialidad: 'CrossFit',
      calificacion: 4.9,
      total_resenas: 67,
      tarifa_por_hora: 550,
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre_completo: 'María González',
      especialidad: 'Running',
      calificacion: 4.7,
      total_resenas: 32,
      tarifa_por_hora: 400,
      foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
    }
  ];

  // Filtros de búsqueda
  busquedaRapida = {
    deporte: '',
    fecha: '',
    precioMaximo: null
  };

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarContador();
  }
  
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
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
    // Cambiar a vista de historial o navegar
    this.vistaActiva = 'pasadas';
  }
  
  verPerfil(): void {
    this.router.navigate(['/pages/cliente/perfil']);
  }
  
  contactarEntrenador(entrenador: any): void {
    // Por ahora navegar a agendar sesión con el entrenador
    // En el futuro: implementar sistema de mensajería
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: { entrenador: entrenador.nombre, mensaje: true }
    });
  }
  
  reagendarSesion(sesion: any): void {
    // Navegar a agendar sesión con datos para reagendar
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: { 
        reagendar: sesion.id,
        entrenador: sesion.entrenador?.nombre 
      }
    });
  }

  cargarDatos(): void {
    this.loading = true;
    
    // Cargar estadísticas del dashboard
    this.clienteService.getDashboardStats().pipe(
      catchError(error => {
        console.warn('Error al cargar dashboard, usando datos mock:', error);
        // Si hay error, usar datos mock como fallback
        return of(this.getMockDashboardStats());
      }),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      if (data) {
        this.actualizarDatosDesdeAPI(data);
      }
    });

    // Cargar próximas sesiones
    this.clienteService.misReservas().pipe(
      catchError(error => {
        console.warn('Error al cargar reservas, usando datos mock:', error);
        return of([]);
      })
    ).subscribe(reservas => {
      if (reservas && reservas.length > 0) {
        const sesionesFormateadas = reservas
          .map((r: any) => ({
            id: r.id,
            fecha_hora: new Date(r.fecha_hora),
            entrenador: {
              id: r.entrenador?.id,
              nombre: r.entrenador?.nombre_completo || r.entrenador?.nombre || 'Entrenador',
              foto: r.entrenador?.foto_url || 'assets/images/avatar-default.png'
            },
            deporte: r.deporte || r.clase?.deporte || 'General',
            duracion: r.duracion || 60,
            estado: r.estado,
            ubicacion: r.ubicacion || r.modalidad || 'No especificada',
            calificacion: r.calificacion
          }));
        
        // Separar próximas de historial
        const ahora = new Date();
        this.proximasSesiones = sesionesFormateadas
          .filter((s: any) => new Date(s.fecha_hora) >= ahora && 
                  (s.estado === 'CONFIRMADA' || s.estado === 'PENDIENTE'))
          .sort((a: any, b: any) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
          .slice(0, 5);
        
        this.historialSesiones = sesionesFormateadas
          .filter((s: any) => new Date(s.fecha_hora) < ahora || s.estado === 'COMPLETADA')
          .sort((a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
          .slice(0, 10);
        
        // Establecer próxima sesión destacada
        if (this.proximasSesiones.length > 0) {
          this.proximaSesion = this.proximasSesiones[0];
        }
      }
    });
  }

  private actualizarDatosDesdeAPI(data: any): void {
    // Actualizar estadísticas del HUB personal
    if (data.estadisticas) {
      // Progreso mensual
      this.totalSesionesMes = data.estadisticas.sesionesCompletadas || 0;
      this.totalHorasMes = data.estadisticas.horasTotales || Math.round(this.totalSesionesMes * 1.2);
      this.tendenciaSesiones = data.estadisticas.tendencia || 0;
      this.caloriasQuemadas = data.estadisticas.calorias || (this.totalHorasMes * 200);
      
      // Racha y logros
      this.racha = data.estadisticas.racha || 0;
      this.logrosDesbloqueados = data.estadisticas.logros || 0;
      this.progresoMes = data.estadisticas.progresoMes || 0;
      
      // Coaches y deportes
      this.entrenadoresUnicos = data.estadisticas.entrenadoresUnicos || 0;
      this.deportesPracticados = data.estadisticas.deportesPracticados || 0;
      this.deportesLista = data.estadisticas.deportesLista || [];
    }
    
    // Actualizar datos del cliente
    if (data.cliente) {
      this.cliente = data.cliente;
    }

    // Actualizar entrenadores favoritos
    if (data.entrenadoresFavoritos && data.entrenadoresFavoritos.length > 0) {
      this.entrenadoresFavoritos = data.entrenadoresFavoritos;
    }
    
    // Actualizar logros recientes
    if (data.logrosRecientes) {
      this.logrosRecientes = data.logrosRecientes;
    }
  }

  private getMockDashboardStats(): any {
    return {
      estadisticas: {
        sesionesCompletadas: 12,
        reservasPendientes: 2,
        gastoMes: 120
      }
    };
  }

  private formatearFecha(fecha: string | Date): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${meses[date.getMonth()]} - ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  buscarEntrenadores() {
    // Navegar al landing público con la búsqueda de entrenadores
    this.router.navigate(['/entrenadores']);
  }

  verSesion(sesion: any) {
    // Navegar a mis sesiones con la sesión destacada
    this.router.navigate(['/pages/cliente/mis-reservas'], {
      queryParams: { sesion: sesion.id }
    });
  }

  cancelarSesion(sesion: any) {
    if (confirm('¿Estás seguro de que deseas cancelar esta sesión?')) {
      // Actualizar estado local
      sesion.estado = 'CANCELADA';
      // Remover de próximas sesiones
      this.proximasSesiones = this.proximasSesiones.filter((s: any) => s.id !== sesion.id);
      if (this.proximaSesion?.id === sesion.id) {
        this.proximaSesion = this.proximasSesiones.length > 0 ? this.proximasSesiones[0] : null;
      }
    }
  }

  agendarConEntrenador(entrenador: any) {
    // Navegar a agendar sesión con el entrenador preseleccionado
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
