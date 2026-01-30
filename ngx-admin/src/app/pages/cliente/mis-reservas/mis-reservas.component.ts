import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbToastrService } from '@nebular/theme';

type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

interface Reserva {
  id: number;
  numero_reserva: string;
  entrenador: {
    nombre: string;
    foto_url: string;
    especialidad: string;
  };
  fecha: Date;
  hora: string;
  duracion: number;
  modalidad: string;
  estado: EstadoReserva;
  precio_total: number;
  notas?: string;
  fecha_creacion: Date;
}

@Component({
  selector: 'ngx-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.scss']
})
export class MisReservasComponent {
  tabSeleccionado = 0;
  
  // Filtros
  filtroFecha: Date | null = null;
  filtroEntrenador = '';
  filtroBusqueda = '';

  // Todas las reservas (datos mock - precios en MXN)
  todasReservas: Reserva[] = [
    {
      id: 1,
      numero_reserva: 'RSV-ABC123',
      entrenador: {
        nombre: 'Ana Pérez García',
        foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Yoga & Pilates'
      },
      fecha: new Date(2026, 1, 20),
      hora: '10:00',
      duracion: 1,
      modalidad: 'Presencial',
      estado: 'CONFIRMADA',
      precio_total: 450,
      notas: 'Primera sesión de yoga',
      fecha_creacion: new Date(2026, 1, 13)
    },
    {
      id: 2,
      numero_reserva: 'RSV-DEF456',
      entrenador: {
        nombre: 'Carlos Ruiz López',
        foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        especialidad: 'CrossFit & Funcional'
      },
      fecha: new Date(2026, 1, 15),
      hora: '18:00',
      duracion: 1.5,
      modalidad: 'Presencial',
      estado: 'PENDIENTE',
      precio_total: 675,
      fecha_creacion: new Date(2026, 1, 12)
    },
    {
      id: 3,
      numero_reserva: 'RSV-GHI789',
      entrenador: {
        nombre: 'María González',
        foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Running & Atletismo'
      },
      fecha: new Date(2026, 0, 25),
      hora: '07:00',
      duracion: 1,
      modalidad: 'Online',
      estado: 'COMPLETADA',
      precio_total: 350,
      notas: 'Sesión de técnica de carrera',
      fecha_creacion: new Date(2026, 0, 20)
    },
    {
      id: 4,
      numero_reserva: 'RSV-JKL012',
      entrenador: {
        nombre: 'David Martínez',
        foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Boxeo'
      },
      fecha: new Date(2026, 0, 18),
      hora: '16:00',
      duracion: 1,
      modalidad: 'Presencial',
      estado: 'CANCELADA',
      precio_total: 500,
      notas: 'Cancelada por el cliente',
      fecha_creacion: new Date(2026, 0, 15)
    },
    {
      id: 5,
      numero_reserva: 'RSV-MNO345',
      entrenador: {
        nombre: 'Ana Pérez García',
        foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Yoga & Pilates'
      },
      fecha: new Date(2026, 0, 10),
      hora: '10:00',
      duracion: 1,
      modalidad: 'Online',
      estado: 'COMPLETADA',
      precio_total: 400,
      fecha_creacion: new Date(2026, 0, 5)
    }
  ];

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private toastr: NbToastrService
  ) {}

  // Filtrado por estado
  get reservasPendientes(): Reserva[] {
    return this.filtrarReservas('PENDIENTE');
  }

  get reservasConfirmadas(): Reserva[] {
    return this.filtrarReservas('CONFIRMADA');
  }

  get reservasCompletadas(): Reserva[] {
    return this.filtrarReservas('COMPLETADA');
  }

  get reservasCanceladas(): Reserva[] {
    return this.filtrarReservas('CANCELADA');
  }

  filtrarReservas(estado: EstadoReserva): Reserva[] {
    let reservas = this.todasReservas.filter(r => r.estado === estado);

    // Aplicar filtros adicionales
    if (this.filtroEntrenador) {
      reservas = reservas.filter(r => 
        r.entrenador.nombre.toLowerCase().includes(this.filtroEntrenador.toLowerCase())
      );
    }

    if (this.filtroBusqueda) {
      reservas = reservas.filter(r =>
        r.numero_reserva.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        r.entrenador.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase())
      );
    }

    if (this.filtroFecha) {
      reservas = reservas.filter(r => 
        r.fecha.toDateString() === this.filtroFecha?.toDateString()
      );
    }

    return reservas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  // Acciones
  verDetalles(reserva: Reserva): void {
    // Mostrar detalles en toast por ahora (en producción sería un modal)
    this.toastr.info(
      `${reserva.entrenador.especialidad} · ${this.formatearFecha(reserva.fecha)} a las ${reserva.hora}`,
      `Reserva ${reserva.numero_reserva}`,
      { duration: 5000, icon: 'info-outline' }
    );
  }

  confirmarReserva(reserva: Reserva): void {
    reserva.estado = 'CONFIRMADA';
    this.toastr.success(
      `Tu sesión con ${reserva.entrenador.nombre} ha sido confirmada`,
      '¡Reserva Confirmada!',
      { duration: 4000, icon: 'checkmark-circle-outline' }
    );
  }

  cancelarReserva(reserva: Reserva): void {
    if (confirm(`¿Estás seguro de cancelar la reserva ${reserva.numero_reserva}?`)) {
      reserva.estado = 'CANCELADA';
      this.toastr.warning(
        'Tu reserva ha sido cancelada exitosamente',
        'Reserva Cancelada',
        { duration: 4000, icon: 'close-circle-outline' }
      );
    }
  }

  reprogramarReserva(reserva: Reserva): void {
    // Navegar a agendar sesión con parámetros
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: { 
        reprogramar: reserva.id,
        entrenador: reserva.entrenador.nombre 
      }
    });
  }

  dejarResena(reserva: Reserva): void {
    // Navegar a reseñas con el entrenador preseleccionado
    this.router.navigate(['/pages/cliente/mis-resenas'], {
      queryParams: { 
        nueva: true,
        entrenador: reserva.entrenador.nombre,
        sesion: reserva.id
      }
    });
  }

  descargarRecibo(reserva: Reserva): void {
    // Simular descarga de recibo
    this.toastr.primary(
      `Descargando recibo de la reserva ${reserva.numero_reserva}...`,
      'Descarga Iniciada',
      { duration: 3000, icon: 'download-outline' }
    );
    // En producción: llamar a un servicio que genere el PDF
  }

  limpiarFiltros(): void {
    this.filtroFecha = null;
    this.filtroEntrenador = '';
    this.filtroBusqueda = '';
  }

  // Utilidades
  getEstadoBadgeStatus(estado: EstadoReserva): string {
    const statusMap: Record<EstadoReserva, string> = {
      'PENDIENTE': 'warning',
      'CONFIRMADA': 'info',
      'COMPLETADA': 'success',
      'CANCELADA': 'danger'
    };
    return statusMap[estado];
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(fecha);
  }

  getDuracionTexto(duracion: number): string {
    if (duracion === 1) return '1 hora';
    if (duracion < 1) return `${duracion * 60} minutos`;
    return `${duracion} horas`;
  }

  esProxima(fecha: Date): boolean {
    const hoy = new Date();
    const diff = fecha.getTime() - hoy.getTime();
    const dias = diff / (1000 * 60 * 60 * 24);
    return dias > 0 && dias <= 7;
  }
}
