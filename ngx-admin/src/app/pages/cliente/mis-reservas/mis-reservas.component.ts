import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';

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
export class MisReservasComponent implements OnInit {
  tabSeleccionado = 0;
  
  // Filtros
  filtroFecha: Date | null = null;
  filtroEntrenador = '';
  filtroBusqueda = '';

  // Todas las reservas
  todasReservas: Reserva[] = [
    {
      id: 1,
      numero_reserva: 'RSV-ABC123',
      entrenador: {
        nombre: 'Ana Pérez García',
        foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Yoga & Pilates'
      },
      fecha: new Date(2025, 10, 20),
      hora: '10:00',
      duracion: 1,
      modalidad: 'Presencial',
      estado: 'CONFIRMADA',
      precio_total: 33,
      notas: 'Primera sesión de yoga',
      fecha_creacion: new Date(2025, 10, 13)
    },
    {
      id: 2,
      numero_reserva: 'RSV-DEF456',
      entrenador: {
        nombre: 'Carlos Ruiz López',
        foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        especialidad: 'CrossFit & Funcional'
      },
      fecha: new Date(2025, 10, 15),
      hora: '18:00',
      duracion: 1.5,
      modalidad: 'Presencial',
      estado: 'PENDIENTE',
      precio_total: 57.75,
      fecha_creacion: new Date(2025, 10, 12)
    },
    {
      id: 3,
      numero_reserva: 'RSV-GHI789',
      entrenador: {
        nombre: 'María González',
        foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Running & Atletismo'
      },
      fecha: new Date(2025, 10, 5),
      hora: '07:00',
      duracion: 1,
      modalidad: 'Online',
      estado: 'COMPLETADA',
      precio_total: 27.5,
      notas: 'Sesión de técnica de carrera',
      fecha_creacion: new Date(2025, 10, 1)
    },
    {
      id: 4,
      numero_reserva: 'RSV-JKL012',
      entrenador: {
        nombre: 'David Martínez',
        foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Boxeo'
      },
      fecha: new Date(2025, 9, 28),
      hora: '16:00',
      duracion: 1,
      modalidad: 'Presencial',
      estado: 'CANCELADA',
      precio_total: 44,
      notas: 'Cancelada por el cliente',
      fecha_creacion: new Date(2025, 9, 25)
    },
    {
      id: 5,
      numero_reserva: 'RSV-MNO345',
      entrenador: {
        nombre: 'Ana Pérez García',
        foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        especialidad: 'Yoga & Pilates'
      },
      fecha: new Date(2025, 9, 15),
      hora: '10:00',
      duracion: 1,
      modalidad: 'Online',
      estado: 'COMPLETADA',
      precio_total: 33,
      fecha_creacion: new Date(2025, 9, 10)
    }
  ];

  constructor(private dialogService: NbDialogService) {}

  ngOnInit(): void {}

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
    console.log('Ver detalles de:', reserva);
    // TODO: Abrir modal con detalles
  }

  confirmarReserva(reserva: Reserva): void {
    reserva.estado = 'CONFIRMADA';
    console.log('Reserva confirmada:', reserva);
  }

  cancelarReserva(reserva: Reserva): void {
    if (confirm(`¿Estás seguro de cancelar la reserva ${reserva.numero_reserva}?`)) {
      reserva.estado = 'CANCELADA';
      console.log('Reserva cancelada:', reserva);
    }
  }

  reprogramarReserva(reserva: Reserva): void {
    console.log('Reprogramar reserva:', reserva);
    // TODO: Navegar a agendar con datos precargados
  }

  dejarResena(reserva: Reserva): void {
    console.log('Dejar reseña para:', reserva);
    // TODO: Navegar a crear reseña
  }

  descargarRecibo(reserva: Reserva): void {
    console.log('Descargar recibo:', reserva);
    // TODO: Generar PDF
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
    return new Intl.DateTimeFormat('es-ES', {
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
