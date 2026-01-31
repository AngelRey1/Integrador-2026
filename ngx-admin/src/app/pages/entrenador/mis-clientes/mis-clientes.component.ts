import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntrenadorFirebaseService, ClienteResumen } from '../../../@core/services/entrenador-firebase.service';
import { Subscription } from 'rxjs';

interface Cliente {
  id: string;
  nombre: string;
  avatar: string;
  email: string;
  telefono: string;
  sesiones_totales: number;
  sesiones_completadas: number;
  ultima_sesion: Date | null;
  notas: string;
}

@Component({
  selector: 'ngx-mis-clientes',
  templateUrl: './mis-clientes.component.html',
  styleUrls: ['./mis-clientes.component.scss']
})
export class MisClientesComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  filtro = '';
  loading = true;
  clienteSeleccionado: string | null = null;

  private subscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private entrenadorFirebase: EntrenadorFirebaseService
  ) { }

  ngOnInit(): void {
    // Verificar si hay un cliente específico en query params
    this.route.queryParams.subscribe(params => {
      this.clienteSeleccionado = params['cliente'] || null;
    });

    this.cargarClientes();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarClientes(): void {
    this.loading = true;
    this.subscription = this.entrenadorFirebase.getMisClientes().subscribe(clientes => {
      this.clientes = clientes.map(c => this.convertirCliente(c));
      this.loading = false;
    });
  }

  private convertirCliente(c: ClienteResumen): Cliente {
    const ultimaSesion = c.ultimaSesion instanceof Date
      ? c.ultimaSesion
      : c.ultimaSesion
        ? new Date((c.ultimaSesion as any)?.seconds * 1000)
        : null;

    return {
      id: c.clienteId,
      nombre: c.nombre,
      avatar: c.foto || 'assets/images/avatar-default.png',
      email: '', // No disponible en resumen
      telefono: '', // No disponible en resumen
      sesiones_totales: c.sesiones,
      sesiones_completadas: c.sesiones,
      ultima_sesion: ultimaSesion,
      notas: ''
    };
  }

  get clientesFiltrados(): Cliente[] {
    if (!this.filtro) return this.clientes;
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      c.email.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  getTasaAsistencia(cliente: Cliente): number {
    if (cliente.sesiones_totales === 0) return 100;
    return Math.round((cliente.sesiones_completadas / cliente.sesiones_totales) * 100);
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return 'Sin sesiones';
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }
}

