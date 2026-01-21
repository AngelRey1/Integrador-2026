import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../@core/services/cliente.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-cliente-dashboard',
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteDashboardComponent implements OnInit {
  loading = false;
  // Stats cards para la fila superior
  statsCards = [
    {
      title: 'Sesiones Completadas',
      value: '12',
      icon: 'checkmark-circle-2-outline',
      status: 'success',
      iconClass: 'success',
      class: 'stat-card'
    },
    {
      title: 'Próxima Sesión',
      value: '15 Nov - 10:00',
      icon: 'clock-outline',
      status: 'primary',
      iconClass: 'primary',
      class: 'stat-card'
    },
    {
      title: 'Reservas Pendientes',
      value: '2',
      icon: 'calendar-outline',
      status: 'warning',
      iconClass: 'warning',
      class: 'stat-card'
    },
    {
      title: 'Gasto del Mes',
      value: '120€',
      icon: 'credit-card-outline',
      status: 'info',
      iconClass: 'info',
      class: 'stat-card'
    }
  ];

  // Estadísticas superiores
  stats = {
    sesionesCompletadas: 12,
    proximaSesion: {
      fecha: new Date('2025-11-15T10:00:00'),
      entrenador: 'Ana Pérez',
      deporte: 'Yoga'
    },
    reservasPendientes: 2,
    gastoMes: 120
  };

  // Próximas sesiones
  proximasSesiones = [
    {
      id: 1,
      fecha_hora: new Date('2025-11-15T10:00:00'),
      entrenador: {
        nombre: 'Ana Pérez',
        foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
      },
      deporte: 'Yoga',
      duracion: 60,
      estado: 'CONFIRMADA',
      ubicacion: 'Gym Centro'
    },
    {
      id: 2,
      fecha_hora: new Date('2025-11-18T16:00:00'),
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
      tarifa_por_hora: 30,
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre_completo: 'Carlos Ruiz',
      especialidad: 'CrossFit',
      calificacion: 4.9,
      total_resenas: 67,
      tarifa_por_hora: 35,
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre_completo: 'María González',
      especialidad: 'Running',
      calificacion: 4.7,
      total_resenas: 32,
      tarifa_por_hora: 25,
      foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
    }
  ];

  // Filtros de búsqueda
  busquedaRapida = {
    deporte: '',
    fecha: '',
    precioMaximo: null
  };

  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.cargarDatos();
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
        this.proximasSesiones = reservas
          .filter((r: any) => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE')
          .slice(0, 5)
          .map((r: any) => ({
            id: r.id,
            fecha_hora: new Date(r.fecha_hora),
            entrenador: {
              nombre: r.entrenador?.nombre_completo || r.entrenador?.nombre || 'Entrenador',
              foto: r.entrenador?.foto_url || 'assets/images/avatar-default.png'
            },
            deporte: r.deporte || r.clase?.deporte || 'General',
            duracion: r.duracion || 60,
            estado: r.estado,
            ubicacion: r.ubicacion || r.modalidad || 'No especificada'
          }));
      }
    });
  }

  private actualizarDatosDesdeAPI(data: any): void {
    // Actualizar stats cards desde la API
    if (data.estadisticas) {
      this.statsCards = [
        {
          title: 'Sesiones Completadas',
          value: data.estadisticas.sesionesCompletadas?.toString() || '0',
          icon: 'checkmark-circle-2-outline',
          status: 'success',
          iconClass: 'success',
          class: 'stat-card'
        },
        {
          title: 'Próxima Sesión',
          value: data.estadisticas.proximaSesion 
            ? this.formatearFecha(data.estadisticas.proximaSesion.fecha)
            : 'Sin sesiones',
          icon: 'clock-outline',
          status: 'primary',
          iconClass: 'primary',
          class: 'stat-card'
        },
        {
          title: 'Reservas Pendientes',
          value: data.estadisticas.reservasPendientes?.toString() || '0',
          icon: 'calendar-outline',
          status: 'warning',
          iconClass: 'warning',
          class: 'stat-card'
        },
        {
          title: 'Gasto del Mes',
          value: `€${data.estadisticas.gastoMes || 0}`,
          icon: 'credit-card-outline',
          status: 'info',
          iconClass: 'info',
          class: 'stat-card'
        }
      ];

      this.stats = {
        sesionesCompletadas: data.estadisticas.sesionesCompletadas || 0,
        proximaSesion: data.estadisticas.proximaSesion || null,
        reservasPendientes: data.estadisticas.reservasPendientes || 0,
        gastoMes: data.estadisticas.gastoMes || 0
      };
    }

    // Actualizar entrenadores favoritos
    if (data.entrenadoresFavoritos && data.entrenadoresFavoritos.length > 0) {
      this.entrenadoresFavoritos = data.entrenadoresFavoritos;
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
    console.log('Buscar con filtros:', this.busquedaRapida);
    // TODO: Navegar a buscar-entrenadores con filtros
  }

  verSesion(sesion: any) {
    console.log('Ver sesión:', sesion);
    // TODO: Abrir modal con detalles
  }

  cancelarSesion(sesion: any) {
    console.log('Cancelar sesión:', sesion);
    // TODO: Confirmar y cancelar
  }

  agendarConEntrenador(entrenador: any) {
    console.log('Agendar con:', entrenador);
    // TODO: Navegar a agendar-sesion
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
