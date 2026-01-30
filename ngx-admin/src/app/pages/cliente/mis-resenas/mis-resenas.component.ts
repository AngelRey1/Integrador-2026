import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService } from '@nebular/theme';

interface Resena {
  id: number;
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
export class MisResenasComponent implements OnInit {
  resenaForm: FormGroup;
  resenas: Resena[] = [];
  resenasFiltradas: Resena[] = [];
  resenaEnEdicion: Resena | null = null;
  
  // Estados
  mostrarFormulario = false;
  cargando = false;
  
  // Filtros
  filtroBusqueda = '';
  filtroCalificacion = 0;

  // Opciones de filtro
  calificacionesDisponibles = [
    { value: 0, label: 'Todas las calificaciones' },
    { value: 5, label: '⭐⭐⭐⭐⭐ (5 estrellas)' },
    { value: 4, label: '⭐⭐⭐⭐ (4 estrellas)' },
    { value: 3, label: '⭐⭐⭐ (3 estrellas)' },
    { value: 2, label: '⭐⭐ (2 estrellas)' },
    { value: 1, label: '⭐ (1 estrella)' }
  ];

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
    private dialogService: NbDialogService
  ) {
    this.resenaForm = this.fb.group({
      calificacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.cargarResenas();
  }

  cargarResenas(): void {
    // Mock data - reemplazar con servicio real
    this.resenas = [
      {
        id: 1,
        entrenador: {
          nombre: 'Ana Pérez García',
          avatar: 'https://i.pravatar.cc/150?img=1',
          especialidad: 'Yoga & Pilates'
        },
        sesion: {
          fecha: new Date(2026, 1, 10),
          deporte: 'Yoga'
        },
        calificacion: 5,
        comentario: 'Excelente entrenadora, muy profesional y atenta. Las sesiones son dinámicas y efectivas.',
        fecha_creacion: new Date(2026, 1, 11),
        respuesta_entrenador: {
          texto: '¡Muchas gracias por tus palabras! Es un placer trabajar contigo.',
          fecha: new Date(2026, 1, 12)
        }
      },
      {
        id: 2,
        entrenador: {
          nombre: 'Carlos Ruiz López',
          avatar: 'https://i.pravatar.cc/150?img=12',
          especialidad: 'CrossFit & HIIT'
        },
        sesion: {
          fecha: new Date(2026, 1, 5),
          deporte: 'CrossFit'
        },
        calificacion: 4,
        comentario: 'Muy buenos entrenamientos, aunque a veces un poco intensos para principiantes.',
        fecha_creacion: new Date(2026, 1, 6)
      },
      {
        id: 3,
        entrenador: {
          nombre: 'María González',
          avatar: 'https://i.pravatar.cc/150?img=5',
          especialidad: 'Running & Atletismo'
        },
        sesion: {
          fecha: new Date(2026, 0, 28),
          deporte: 'Running'
        },
        calificacion: 5,
        comentario: 'Súper recomendada. Me ayudó a mejorar mi técnica de carrera significativamente.',
        fecha_creacion: new Date(2026, 0, 29),
        respuesta_entrenador: {
          texto: 'Gracias por tu confianza. Sigue así, vas muy bien!',
          fecha: new Date(2026, 0, 30)
        }
      },
      {
        id: 4,
        entrenador: {
          nombre: 'David Martínez',
          avatar: 'https://i.pravatar.cc/150?img=8',
          especialidad: 'Boxeo & Artes Marciales'
        },
        sesion: {
          fecha: new Date(2026, 0, 20),
          deporte: 'Boxeo'
        },
        calificacion: 3,
        comentario: 'Buen entrenador, pero las instalaciones donde entrena podrían mejorar.',
        fecha_creacion: new Date(2026, 0, 21)
      }
    ];

    this.aplicarFiltros();
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
      this.resenas = this.resenas.filter(r => r.id !== this.resenaEnEdicion!.id);
      this.aplicarFiltros();
      console.log('Reseña eliminada:', this.resenaEnEdicion.id);
    }
    ref.close();
  }

  guardarResena(): void {
    if (this.resenaForm.invalid) {
      Object.keys(this.resenaForm.controls).forEach(key => {
        this.resenaForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.resenaForm.value;

    if (this.resenaEnEdicion) {
      // Editar reseña existente
      const index = this.resenas.findIndex(r => r.id === this.resenaEnEdicion!.id);
      if (index !== -1) {
        this.resenas[index] = {
          ...this.resenas[index],
          calificacion: formValue.calificacion,
          comentario: formValue.comentario,
          fecha_edicion: new Date()
        };
        console.log('Reseña actualizada:', this.resenas[index]);
      }
    } else {
      // Nueva reseña
      const nuevaResena: Resena = {
        id: Math.max(...this.resenas.map(r => r.id), 0) + 1,
        entrenador: {
          nombre: 'Entrenador Demo',
          avatar: 'https://i.pravatar.cc/150?img=15',
          especialidad: 'Especialidad Demo'
        },
        sesion: {
          fecha: new Date(),
          deporte: 'Demo'
        },
        calificacion: formValue.calificacion,
        comentario: formValue.comentario,
        fecha_creacion: new Date()
      };
      this.resenas.unshift(nuevaResena);
      console.log('Nueva reseña creada:', nuevaResena);
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
