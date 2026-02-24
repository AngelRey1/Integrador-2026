import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService, ClienteResumen } from '../../../@core/services/entrenador-firebase.service';
import { Subscription } from 'rxjs';

interface Cliente {
  id: string;
  nombre: string;
  avatar: string;
  totalReservas: number;
  sesionesCompletadas: number;
  ultimaSesion: Date | null;
  primeraSesion: Date | null;
  gastoTotal: number;
  esFrecuente: boolean;
  tiempoComoCliente: string;
  tasaAsistencia: number;
}

@Component({
  selector: 'ngx-mis-clientes',
  templateUrl: './mis-clientes.component.html',
  styleUrls: ['./mis-clientes.component.scss']
})
export class MisClientesComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  filtro = '';
  filtroTipo: 'todos' | 'frecuentes' | 'nuevos' = 'todos';
  loading = true;
  clienteSeleccionado: Cliente | null = null;

  // Estadísticas generales
  stats = {
    totalClientes: 0,
    clientesFrecuentes: 0,
    clientesNuevos: 0,
    ingresosTotales: 0
  };

  private subscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private entrenadorFirebase: EntrenadorFirebaseService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarClientes(): void {
    this.loading = true;
    this.subscription = this.entrenadorFirebase.getMisClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes.map(c => this.convertirCliente(c));
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.clientes = [];
        this.loading = false;
        this.toastrService.warning('No se pudieron cargar los clientes', 'Aviso');
      }
    });
  }

  private convertirCliente(c: ClienteResumen): Cliente {
    const ultimaSesion = this.convertirFecha(c.ultimaSesion);
    const primeraSesion = this.convertirFecha(c.primeraSesion);
    
    const sesionesCompletadas = c.sesionesCompletadas || 0;
    const totalReservas = c.sesiones || 0;
    
    // Cliente frecuente: 3+ sesiones completadas
    const esFrecuente = sesionesCompletadas >= 3;
    
    // Calcular tiempo como cliente
    const tiempoComoCliente = this.calcularTiempoComoCliente(primeraSesion);
    
    // Calcular tasa de asistencia
    const tasaAsistencia = totalReservas > 0 
      ? Math.round((sesionesCompletadas / totalReservas) * 100) 
      : 0;

    return {
      id: c.clienteId,
      nombre: c.nombre,
      avatar: c.foto || '',
      totalReservas,
      sesionesCompletadas,
      ultimaSesion,
      primeraSesion,
      gastoTotal: c.gastoTotal || 0,
      esFrecuente,
      tiempoComoCliente,
      tasaAsistencia
    };
  }

  private convertirFecha(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (fecha?.seconds) return new Date(fecha.seconds * 1000);
    return new Date(fecha);
  }

  private calcularTiempoComoCliente(primeraSesion: Date | null): string {
    if (!primeraSesion) return 'Nuevo';
    
    const ahora = new Date();
    const diff = ahora.getTime() - primeraSesion.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return '1 día';
    if (dias < 7) return `${dias} días`;
    if (dias < 30) {
      const semanas = Math.floor(dias / 7);
      return semanas === 1 ? '1 semana' : `${semanas} semanas`;
    }
    if (dias < 365) {
      const meses = Math.floor(dias / 30);
      return meses === 1 ? '1 mes' : `${meses} meses`;
    }
    const anos = Math.floor(dias / 365);
    return anos === 1 ? '1 año' : `${anos} años`;
  }

  private calcularEstadisticas(): void {
    const ahora = new Date();
    const hace30Dias = new Date(ahora);
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    this.stats.totalClientes = this.clientes.length;
    this.stats.clientesFrecuentes = this.clientes.filter(c => c.esFrecuente).length;
    this.stats.clientesNuevos = this.clientes.filter(c => 
      c.primeraSesion && c.primeraSesion >= hace30Dias
    ).length;
    this.stats.ingresosTotales = this.clientes.reduce((sum, c) => sum + c.gastoTotal, 0);
  }

  get clientesFiltrados(): Cliente[] {
    let resultado = this.clientes;
    
    // Filtrar por tipo
    if (this.filtroTipo === 'frecuentes') {
      resultado = resultado.filter(c => c.esFrecuente);
    } else if (this.filtroTipo === 'nuevos') {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      resultado = resultado.filter(c => c.primeraSesion && c.primeraSesion >= hace30Dias);
    }
    
    // Filtrar por búsqueda
    if (this.filtro) {
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(this.filtro.toLowerCase())
      );
    }
    
    return resultado;
  }

  verDetalles(cliente: Cliente): void {
    this.clienteSeleccionado = this.clienteSeleccionado?.id === cliente.id ? null : cliente;
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return 'Sin datos';
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(monto);
  }

  getIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getTasaColor(tasa: number): string {
    if (tasa >= 80) return 'success';
    if (tasa >= 50) return 'warning';
    return 'danger';
  }
}

