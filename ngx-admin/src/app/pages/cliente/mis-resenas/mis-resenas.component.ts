import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ClienteFirebaseService, Review } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

interface Resena {
  id: string;
  entrenadorId: string;
  reservaId: string;
  entrenador: {
    nombre: string;
    avatar: string;
    especialidad: string;
  };
  sesion: {
    fecha: Date;
    deporte: string;
  };
  calificacion: number;
  comentario: string;
  fecha_creacion: Date;
  fecha_edicion?: Date;
  respuesta_entrenador?: {
    texto: string;
    fecha: Date;
  };
}

@Component({
  selector: 'ngx-mis-resenas',
  templateUrl: './mis-resenas.component.html',
  styleUrls: ['./mis-resenas.component.scss']
})
export class MisResenasComponent implements OnInit, OnDestroy {
  resenaForm: FormGroup;
  resenas: Resena[] = [];
  resenasFiltradas: Resena[] = [];
  resenaEnEdicion: Resena | null = null;
  loading = true;

  // Estados
  mostrarFormulario = false;
  cargando = false;

  // Filtros
  filtroBusqueda = '';
  filtroCalificacion = 0;

  // Para nueva reseña desde query params
  entrenadorIdNuevo: string | null = null;
  sesionIdNueva: string | null = null;

  // Opciones de filtro
  calificacionesDisponibles = [
    { value: 0, label: 'Todas las calificaciones' },
    { value: 5, label: '⭐⭐⭐⭐⭐ (5 estrellas)' },
    { value: 4, label: '⭐⭐⭐⭐ (4 estrellas)' },
    { value: 3, label: '⭐⭐⭐ (3 estrellas)' },
    { value: 2, label: '⭐⭐ (2 estrellas)' },
    { value: 1, label: '⭐ (1 estrella)' }
  ];

  private subscription: Subscription | null = null;

  // Estadísticas
  get totalResenas(): number {
    return this.resenas.length;
  }

  get calificacionPromedio(): number {
    if (this.resenas.length === 0) return 0;
    const suma = this.resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return Math.round((suma / this.resenas.length) * 10) / 10;
  }

  get resenasConRespuesta(): number {
    return this.resenas.filter(r => r.respuesta_entrenador).length;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    private clienteFirebase: ClienteFirebaseService
  ) {
    this.resenaForm = this.fb.group({
      calificacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Verificar query params para nueva reseña
    this.route.queryParams.subscribe(params => {
      if (params['nueva'] === 'true') {
        this.entrenadorIdNuevo = params['entrenadorId'] || null;
        this.sesionIdNueva = params['sesion'] || null;
        // Abrir formulario automáticamente
        setTimeout(() => this.nuevaResena(), 500);
      }
    });

    this.cargarResenas();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarResenas(): void {
    this.loading = true;
    this.subscription = this.clienteFirebase.getMisResenas().subscribe(reviews => {
      this.resenas = reviews.map(r => this.convertirResena(r));
      this.aplicarFiltros();
      this.loading = false;
    });
  }

  private convertirResena(r: Review): Resena {
    const fecha = r.fecha instanceof Date ? r.fecha : new Date((r.fecha as any)?.seconds * 1000);

    return {
      id: r.id || '',
      entrenadorId: r.entrenadorId,
      reservaId: r.reservaId,
      entrenador: {
        nombre: 'Entrenador', // Se podría enriquecer con datos del entrenador
        avatar: 'assets/images/avatar-default.png',
        especialidad: 'Deportes'
      },
      sesion: {
        fecha: fecha,
        deporte: 'Sesión'
      },
      calificacion: r.calificacion,
      comentario: r.comentario,
      fecha_creacion: fecha,
      respuesta_entrenador: r.respuestaEntrenador ? {
        texto: r.respuestaEntrenador,
        fecha: fecha
      } : undefined
    };
  }

  aplicarFiltros(): void {
    let resultado = [...this.resenas];

    // Filtro por búsqueda
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(r =>
        r.entrenador.nombre.toLowerCase().includes(busqueda) ||
        r.comentario.toLowerCase().includes(busqueda) ||
        r.sesion.deporte.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por calificación
    if (this.filtroCalificacion > 0) {
      resultado = resultado.filter(r => r.calificacion === this.filtroCalificacion);
    }

    this.resenasFiltradas = resultado.sort((a, b) =>
      b.fecha_creacion.getTime() - a.fecha_creacion.getTime()
    );
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroCalificacion = 0;
    this.aplicarFiltros();
  }

  nuevaResena(): void {
    this.resenaEnEdicion = null;
    this.resenaForm.reset({ calificacion: 0, comentario: '' });
    this.mostrarFormulario = true;
  }

  editarResena(resena: Resena): void {
    this.resenaEnEdicion = resena;
    this.resenaForm.patchValue({
      calificacion: resena.calificacion,
      comentario: resena.comentario
    });
    this.mostrarFormulario = true;
  }

  eliminarResena(resena: Resena, dialog: TemplateRef<any>): void {
    this.resenaEnEdicion = resena;
    this.dialogService.open(dialog, { context: resena });
  }

  confirmarEliminar(ref: any): void {
    if (this.resenaEnEdicion) {
      // Por ahora solo eliminar localmente (Firebase no tiene método de eliminar reseñas aún)
      this.resenas = this.resenas.filter(r => r.id !== this.resenaEnEdicion!.id);
      this.aplicarFiltros();
      this.toastr.success('Reseña eliminada correctamente', 'Eliminada');
    }
    ref.close();
  }

  async guardarResena(): Promise<void> {
    if (this.resenaForm.invalid) {
      Object.keys(this.resenaForm.controls).forEach(key => {
        this.resenaForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.resenaForm.value;
    this.cargando = true;

    if (this.resenaEnEdicion) {
      // Editar reseña existente (actualización local por ahora)
      const index = this.resenas.findIndex(r => r.id === this.resenaEnEdicion!.id);
      if (index !== -1) {
        this.resenas[index] = {
          ...this.resenas[index],
          calificacion: formValue.calificacion,
          comentario: formValue.comentario,
          fecha_edicion: new Date()
        };
        this.toastr.success('Reseña actualizada correctamente', 'Actualizada');
      }
      this.cargando = false;
    } else {
      // Nueva reseña a Firebase
      if (this.entrenadorIdNuevo && this.sesionIdNueva) {
        const result = await this.clienteFirebase.crearResena({
          entrenadorId: this.entrenadorIdNuevo,
          reservaId: this.sesionIdNueva,
          calificacion: formValue.calificacion,
          comentario: formValue.comentario
        });

        if (result.success) {
          this.toastr.success(result.message, '¡Reseña Publicada!');
          // Los datos se actualizarán automáticamente por la suscripción
        } else {
          this.toastr.danger(result.message, 'Error');
        }
      } else {
        this.toastr.warning('Selecciona un entrenador y sesión para dejar una reseña', 'Información incompleta');
      }
      this.cargando = false;
    }

    this.aplicarFiltros();
    this.cancelarFormulario();
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.resenaEnEdicion = null;
    this.resenaForm.reset({ calificacion: 0, comentario: '' });
  }

  setCalificacion(valor: number): void {
    this.resenaForm.patchValue({ calificacion: valor });
  }

  getEstrellas(calificacion: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

  formatearFechaRelativa(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Hace 1 día';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    return this.formatearFecha(fecha);
  }

  get comentarioLength(): number {
    return this.resenaForm.get('comentario')?.value?.length || 0;
  }
}

