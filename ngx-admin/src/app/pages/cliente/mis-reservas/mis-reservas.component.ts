import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ClienteFirebaseService, Reserva as ReservaFirebase } from '../../../@core/services/cliente-firebase.service';
import { ReciboService } from '../../../@core/services/recibo.service';
import { ResenaDialogComponent } from '../resena-dialog/resena-dialog.component';
import { Subscription } from 'rxjs';

type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

interface Reserva {
  id: string;
  numero_reserva: string;
  entrenador: {
    id?: string;
    nombre: string;
    foto_url: string;
    especialidad: string;
  };
  fecha: Date;
  hora: string;
  duracion: number;
  modalidad: string;
  estado: EstadoReserva;
  estadoPago?: string;
  precio_total: number;
  notas?: string;
  fecha_creacion: Date;
}

@Component({
  selector: 'ngx-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.scss']
})
export class MisReservasComponent implements OnInit, OnDestroy {
  tabSeleccionado = 0;
  loading = true;

  // Filtros
  filtroFecha: Date | null = null;
  filtroEntrenador = '';
  filtroBusqueda = '';

  // Todas las reservas desde Firebase
  todasReservas: Reserva[] = [];

  // Datos del cliente para recibos
  clienteDatos: any = { nombre: 'Cliente', email: '' };

  private reservasSubscription: Subscription | null = null;
  private perfilSubscription: Subscription | null = null;

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private toastr: NbToastrService,
    private clienteFirebase: ClienteFirebaseService,
    private reciboService: ReciboService
  ) { }

  ngOnInit(): void {
    // Cargar datos del perfil del cliente
    this.perfilSubscription = this.clienteFirebase.getMiPerfil().subscribe(perfil => {
      if (perfil) {
        this.clienteDatos = {
          nombre: perfil.nombre || 'Cliente',
          email: perfil.email || ''
        };
      }
    });
    this.cargarReservas();
  }

  ngOnDestroy(): void {
    if (this.reservasSubscription) {
      this.reservasSubscription.unsubscribe();
    }
    if (this.perfilSubscription) {
      this.perfilSubscription.unsubscribe();
    }
  }

  cargarReservas(): void {
    this.loading = true;
    this.reservasSubscription = this.clienteFirebase.getMisReservas().subscribe(reservas => {
      this.todasReservas = reservas.map(r => this.convertirReserva(r));
      this.loading = false;
    });
  }

  private convertirReserva(r: ReservaFirebase): Reserva {
    const fecha = r.fecha instanceof Date ? r.fecha : new Date((r.fecha as any)?.seconds * 1000);
    const fechaCreacion = r.fechaCreacion instanceof Date ? r.fechaCreacion : new Date((r.fechaCreacion as any)?.seconds * 1000);

    return {
      id: r.id || '',
      numero_reserva: `RSV-${(r.id || '').slice(-6).toUpperCase()}`,
      entrenador: {
        id: r.entrenadorId,
        nombre: r.entrenadorNombre,
        foto_url: r.entrenadorFoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(r.entrenadorNombre) + '&background=00D09C&color=ffffff&size=128',
        especialidad: (r as any).deporte || 'General'
      },
      fecha: fecha,
      hora: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      duracion: r.duracion ? r.duracion / 60 : 1,
      modalidad: r.modalidad || 'Presencial',
      estado: r.estado as EstadoReserva,
      estadoPago: r.estadoPago || ((r.estado === 'CONFIRMADA' || r.estado === 'COMPLETADA') ? 'COMPLETADO' : 'PENDIENTE'),
      precio_total: r.precio || 0,
      notas: r.notas,
      fecha_creacion: fechaCreacion
    };
  }

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
    this.toastr.info(
      `${reserva.entrenador.especialidad} · ${this.formatearFecha(reserva.fecha)} a las ${reserva.hora}`,
      `Reserva ${reserva.numero_reserva}`,
      { duration: 5000, icon: 'info-outline' }
    );
  }

  async confirmarReserva(reserva: Reserva): Promise<void> {
    const result = await this.clienteFirebase.actualizarEstadoReserva(reserva.id, 'CONFIRMADA');
    if (result.success) {
      this.toastr.success(
        `Tu sesión con ${reserva.entrenador.nombre} ha sido confirmada`,
        '¡Reserva Confirmada!',
        { duration: 4000, icon: 'checkmark-circle-outline' }
      );
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  async cancelarReserva(reserva: Reserva): Promise<void> {
    if (confirm(`¿Estás seguro de cancelar la reserva ${reserva.numero_reserva}?`)) {
      const result = await this.clienteFirebase.cancelarReserva(reserva.id, 'Cancelada por el cliente');
      if (result.success) {
        this.toastr.warning(
          'Tu reserva ha sido cancelada exitosamente',
          'Reserva Cancelada',
          { duration: 4000, icon: 'close-circle-outline' }
        );
      } else {
        this.toastr.danger(result.message, 'Error');
      }
    }
  }

  reprogramarReserva(reserva: Reserva): void {
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: {
        reprogramar: reserva.id,
        entrenador: reserva.entrenador.nombre
      }
    });
  }

  dejarResena(reserva: Reserva): void {
    this.dialogService.open(ResenaDialogComponent, {
      context: {
        reservaId: reserva.id,
        entrenadorId: reserva.entrenador.id || '',
        entrenadorNombre: reserva.entrenador.nombre,
        entrenadorFoto: reserva.entrenador.foto_url
      },
      closeOnBackdropClick: true,
      closeOnEsc: true
    }).onClose.subscribe((result: any) => {
      if (result?.success) {
        this.toastr.success(result.message, '¡Reseña Publicada!', {
          duration: 4000,
          icon: 'star-outline'
        });
      } else if (result && !result.success) {
        this.toastr.danger(result.message, 'Error');
      }
    });
  }

  descargarRecibo(reserva: Reserva): void {
    this.reciboService.generarRecibo({
      numero: reserva.numero_reserva,
      fecha: reserva.fecha_creacion || new Date(),
      cliente: {
        nombre: this.clienteDatos.nombre,
        email: this.clienteDatos.email
      },
      entrenador: {
        nombre: reserva.entrenador.nombre,
        especialidad: reserva.entrenador.especialidad
      },
      sesion: {
        fecha: reserva.fecha,
        hora: reserva.hora,
        duracion: reserva.duracion * 60, // convertir a minutos
        modalidad: reserva.modalidad
      },
      pago: {
        subtotal: reserva.precio_total,
        total: reserva.precio_total,
        metodoPago: 'Tarjeta',
        estado: reserva.estado === 'COMPLETADA' ? 'COMPLETADO' : 'PENDIENTE'
      }
    });

    this.toastr.success(
      'Se abrió el recibo en una nueva ventana',
      'Recibo Generado',
      { duration: 3000, icon: 'file-text-outline' }
    );
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

  getEstadoPagoBadgeStatus(estado: string): string {
    if (estado === 'COMPLETADO') return 'success';
    if (estado === 'REEMBOLSADO') return 'basic';
    if (estado === 'NO_REQUERIDO') return 'info';
    return 'warning'; // PENDIENTE
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

  esPasada(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getTime() < hoy.getTime();
  }
}

