import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService } from '../../../@core/services/entrenador-firebase.service';
import { Subscription } from 'rxjs';

interface ResenaRecibida {
  id: string;
  clienteNombre: string;
  clienteFoto: string;
  calificacion: number;
  comentario: string;
  deporte: string;
  fecha: Date;
  respuesta?: string;
  reservaId: string;
  clienteId: string;
}

@Component({
  selector: 'ngx-mis-resenas-entrenador',
  templateUrl: './mis-resenas-entrenador.component.html',
  styleUrls: ['./mis-resenas-entrenador.component.scss']
})
export class MisResenasEntrenadorComponent implements OnInit, OnDestroy {
  resenas: ResenaRecibida[] = [];
  resenasFiltradas: ResenaRecibida[] = [];
  loading = true;
  respondiendo: string | null = null;
  textoRespuesta = '';
  guardandoRespuesta = false;

  // Filtros
  filtroCalificacion = 0;
  filtroBusqueda = '';

  private sub: Subscription | null = null;

  // Stats computadas
  get totalResenas(): number { return this.resenas.length; }

  get calificacionPromedio(): number {
    if (!this.resenas.length) return 0;
    const suma = this.resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return Math.round((suma / this.resenas.length) * 10) / 10;
  }

  get porcentajePositivas(): number {
    if (!this.resenas.length) return 0;
    const positivas = this.resenas.filter(r => r.calificacion >= 4).length;
    return Math.round((positivas / this.resenas.length) * 100);
  }

  get sinResponder(): number {
    return this.resenas.filter(r => !r.respuesta).length;
  }

  get distribucionEstrellas(): { estrellas: number; count: number; porcentaje: number }[] {
    return [5, 4, 3, 2, 1].map(e => {
      const count = this.resenas.filter(r => r.calificacion === e).length;
      return {
        estrellas: e,
        count,
        porcentaje: this.resenas.length ? Math.round((count / this.resenas.length) * 100) : 0
      };
    });
  }

  constructor(
    private entrenadorFirebase: EntrenadorFirebaseService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.cargarResenas();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  cargarResenas(): void {
    this.loading = true;
    this.sub = this.entrenadorFirebase.getMisResenasRecibidas().subscribe(reviews => {
      this.resenas = reviews.map(r => this.mapear(r));
      this.aplicarFiltros();
      this.loading = false;
    });
  }

  private mapear(r: any): ResenaRecibida {
    const fecha = r.fecha instanceof Date ? r.fecha : new Date((r.fecha as any)?.seconds * 1000 || Date.now());
    return {
      id: r.id || '',
      clienteNombre: r.clienteNombre || 'Cliente',
      clienteFoto: r.clienteFoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.clienteNombre || 'C')}&background=6366F1&color=fff&size=80`,
      calificacion: r.calificacion || 0,
      comentario: r.comentario || '',
      deporte: r.deporte || 'General',
      fecha,
      respuesta: r.respuestaEntrenador || null,
      reservaId: r.reservaId || '',
      clienteId: r.clienteId || ''
    };
  }

  aplicarFiltros(): void {
    let resultado = [...this.resenas];
    if (this.filtroCalificacion > 0) {
      resultado = resultado.filter(r => r.calificacion === this.filtroCalificacion);
    }
    if (this.filtroBusqueda.trim()) {
      const q = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(r =>
        r.clienteNombre.toLowerCase().includes(q) ||
        r.comentario.toLowerCase().includes(q)
      );
    }
    this.resenasFiltradas = resultado.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  limpiarFiltros(): void {
    this.filtroCalificacion = 0;
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  iniciarRespuesta(resena: ResenaRecibida): void {
    this.respondiendo = resena.id;
    this.textoRespuesta = resena.respuesta || '';
  }

  cancelarRespuesta(): void {
    this.respondiendo = null;
    this.textoRespuesta = '';
  }

  async guardarRespuesta(resena: ResenaRecibida): Promise<void> {
    if (!this.textoRespuesta.trim()) return;
    this.guardandoRespuesta = true;
    try {
      await this.entrenadorFirebase.responderResena(resena.id, this.textoRespuesta.trim());
      resena.respuesta = this.textoRespuesta.trim();
      this.toastr.success('Tu respuesta fue publicada', '✅ Respuesta guardada');
      this.cancelarRespuesta();
    } catch {
      this.toastr.danger('No se pudo guardar la respuesta', 'Error');
    }
    this.guardandoRespuesta = false;
  }

  getEstrellas(n: number): number[] { return Array(5).fill(0).map((_, i) => i + 1); }

  formatearFechaRelativa(fecha: Date): string {
    const diff = Date.now() - fecha.getTime();
    const dias = Math.floor(diff / 86400000);
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Hace 1 día';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(fecha);
  }
}
