import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService, Clase as ClaseFirebase } from '../../../@core/services/entrenador-firebase.service';
import { Reserva } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

interface Clase {
  id: string;
  nombre: string;
  deporte: string;
  descripcion: string;
  modalidad: 'presencial' | 'online' | 'ambos';
  duracion: number;
  precio: number;
  capacidad: number;
  ubicacion?: string;
  nivel: string;
  activa: boolean;
}

interface SesionProgramada {
  id: string;
  clienteNombre: string;
  clienteId: string;
  fecha: Date;
  hora: string;
  horaFin?: string;
  duracion: number;
  precio: number;
  modalidad: string;
  estado: string;
  notas?: string;
  ubicacion?: string;
  esHoy: boolean;
  esProxima: boolean;
  tiempoRestante: string;
}

@Component({
  selector: 'ngx-gestion-clases',
  templateUrl: './gestion-clases.component.html',
  styleUrls: ['./gestion-clases.component.scss']
})
export class GestionClasesComponent implements OnInit, OnDestroy {
  claseForm: FormGroup;
  clases: Clase[] = [];
  claseEnEdicion: Clase | null = null;
  mostrarFormulario = false;
  loading = true;
  guardando = false;

  deportesDisponibles = [
    'Fútbol', 'Básquetbol', 'Basketball', 'Tenis', 'Natación', 'Running', 
    'Ciclismo', 'Yoga', 'Pilates', 'CrossFit', 'Boxeo', 'Béisbol', 'Softball',
    'Artes Marciales', 'Volleyball', 'Golf', 'Gimnasia',
    'Entrenamiento Funcional', 'Pesas', 'Cardio', 'Fitness General'
  ];
  nivelesDisponibles = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

  // Sesiones programadas (reservas de clientes)
  sesionesHoy: SesionProgramada[] = [];
  proximasSesiones: SesionProgramada[] = [];
  todasLasSesiones: SesionProgramada[] = [];
  loadingSesiones = true;
  filtroEstado = 'todas';
  vistaActiva: 'sesiones' | 'clases' = 'sesiones';

  private subscription: Subscription | null = null;
  private subscriptionSesiones: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private entrenadorFirebase: EntrenadorFirebaseService
  ) {
    this.claseForm = this.fb.group({
      nombre: ['', Validators.required],
      deporte: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]],
      modalidad: ['presencial', Validators.required],
      duracion: [60, [Validators.required, Validators.min(15)]],
      precio: [500, [Validators.required, Validators.min(50)]],
      capacidad: [10, [Validators.required, Validators.min(1)]],
      ubicacion: [''],
      nivel: ['Todos los niveles', Validators.required],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarClases();
    this.cargarSesiones();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptionSesiones) {
      this.subscriptionSesiones.unsubscribe();
    }
  }

  // ==================== SESIONES PROGRAMADAS ====================

  cargarSesiones(): void {
    this.loadingSesiones = true;
    this.subscriptionSesiones = this.entrenadorFirebase.getMisReservas().subscribe({
      next: (reservas) => {
        this.todasLasSesiones = reservas
          .map(r => this.convertirReservaASesion(r))
          .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        
        this.filtrarSesiones();
        this.loadingSesiones = false;
      },
      error: (error) => {
        console.error('Error al cargar sesiones:', error);
        this.todasLasSesiones = [];
        this.sesionesHoy = [];
        this.proximasSesiones = [];
        this.loadingSesiones = false;
        this.toastrService.warning('No se pudieron cargar las sesiones', 'Aviso');
      }
    });
  }

  private convertirReservaASesion(r: Reserva): SesionProgramada {
    const fecha = r.fecha instanceof Date 
      ? r.fecha 
      : r.fecha 
        ? new Date((r.fecha as any)?.seconds * 1000) 
        : new Date();
    
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const fechaSesion = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    
    const esHoy = fechaSesion.getTime() === hoy.getTime();
    const esProxima = fecha > ahora && (r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA');
    
    return {
      id: r.id || '',
      clienteNombre: r.clienteNombre,
      clienteId: r.clienteId,
      fecha: fecha,
      hora: r.hora,
      horaFin: r.horaFin,
      duracion: r.duracion,
      precio: r.precio,
      modalidad: r.modalidad,
      estado: r.estado,
      notas: r.notas,
      ubicacion: r.ubicacion,
      esHoy,
      esProxima,
      tiempoRestante: this.calcularTiempoRestante(fecha)
    };
  }

  private calcularTiempoRestante(fecha: Date): string {
    const ahora = new Date();
    const diff = fecha.getTime() - ahora.getTime();
    
    if (diff < 0) return 'Pasada';
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (dias > 0) return `En ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `En ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `En ${minutos} min`;
    return 'Ahora';
  }

  filtrarSesiones(): void {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Sesiones de hoy
    this.sesionesHoy = this.todasLasSesiones.filter(s => {
      const fechaSesion = new Date(s.fecha.getFullYear(), s.fecha.getMonth(), s.fecha.getDate());
      return fechaSesion.getTime() === hoy.getTime() && 
             (s.estado === 'PENDIENTE' || s.estado === 'CONFIRMADA');
    });

    // Próximas sesiones (después de hoy)
    this.proximasSesiones = this.todasLasSesiones.filter(s => {
      return s.fecha >= manana && (s.estado === 'PENDIENTE' || s.estado === 'CONFIRMADA');
    });
  }

  getSesionesFiltradas(): SesionProgramada[] {
    if (this.filtroEstado === 'todas') {
      return this.todasLasSesiones.filter(s => s.estado !== 'CANCELADA');
    }
    return this.todasLasSesiones.filter(s => s.estado === this.filtroEstado);
  }

  async confirmarSesion(sesion: SesionProgramada): Promise<void> {
    const result = await this.entrenadorFirebase.confirmarReserva(sesion.id);
    if (result.success) {
      this.toastrService.success('Sesión confirmada', 'Éxito');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
  }

  async completarSesion(sesion: SesionProgramada): Promise<void> {
    const result = await this.entrenadorFirebase.completarReserva(sesion.id);
    if (result.success) {
      this.toastrService.success('Sesión marcada como completada', 'Éxito');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
  }

  async cancelarSesion(sesion: SesionProgramada, dialog: TemplateRef<any>): Promise<void> {
    this.dialogService.open(dialog, { context: sesion });
  }

  async confirmarCancelacion(sesion: SesionProgramada, motivo: string, ref: any): Promise<void> {
    const result = await this.entrenadorFirebase.cancelarReserva(sesion.id, motivo || 'Cancelado por el entrenador');
    if (result.success) {
      this.toastrService.success('Sesión cancelada', 'Éxito');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
    ref.close();
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(fecha);
  }

  formatearFechaCorta(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short'
    }).format(fecha);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CONFIRMADA': return 'success';
      case 'COMPLETADA': return 'info';
      case 'CANCELADA': return 'danger';
      default: return 'basic';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'CONFIRMADA': return 'Confirmada';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  }

  // ==================== CLASES ====================

  cargarClases(): void {
    this.loading = true;
    this.subscription = this.entrenadorFirebase.getMisClases().subscribe(clases => {
      this.clases = clases.map(c => this.convertirClase(c));
      this.loading = false;
    });
  }

  private convertirClase(c: ClaseFirebase): Clase {
    return {
      id: c.id || '',
      nombre: c.nombre,
      deporte: c.deporte,
      descripcion: c.descripcion,
      modalidad: c.modalidad,
      duracion: c.duracion,
      precio: c.precio,
      capacidad: c.capacidad,
      ubicacion: '',
      nivel: 'Todos los niveles',
      activa: c.activa
    };
  }

  nuevaClase(): void {
    this.claseEnEdicion = null;
    this.claseForm.reset({
      modalidad: 'presencial',
      duracion: 60,
      precio: 500,
      capacidad: 10,
      nivel: 'Todos los niveles',
      activa: true
    });
    this.mostrarFormulario = true;
  }

  editarClase(clase: Clase): void {
    this.claseEnEdicion = clase;
    this.claseForm.patchValue(clase);
    this.mostrarFormulario = true;
  }

  async guardarClase(): Promise<void> {
    if (this.claseForm.invalid) {
      Object.keys(this.claseForm.controls).forEach(key => {
        this.claseForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.claseForm.value;
    this.guardando = true;

    if (this.claseEnEdicion) {
      // Editar clase existente
      const result = await this.entrenadorFirebase.actualizarClase(this.claseEnEdicion.id, {
        nombre: formValue.nombre,
        deporte: formValue.deporte,
        descripcion: formValue.descripcion,
        modalidad: formValue.modalidad,
        duracion: formValue.duracion,
        precio: formValue.precio,
        capacidad: formValue.capacidad,
        activa: formValue.activa
      });

      if (result.success) {
        this.toastrService.success(result.message, 'Éxito');
      } else {
        this.toastrService.danger(result.message, 'Error');
      }
    } else {
      // Nueva clase
      const result = await this.entrenadorFirebase.crearClase({
        nombre: formValue.nombre,
        deporte: formValue.deporte,
        descripcion: formValue.descripcion,
        modalidad: formValue.modalidad,
        duracion: formValue.duracion,
        precio: formValue.precio,
        capacidad: formValue.capacidad,
        activa: formValue.activa
      });

      if (result.success) {
        this.toastrService.success(result.message, 'Éxito');
      } else {
        this.toastrService.danger(result.message, 'Error');
      }
    }

    this.guardando = false;
    this.cancelarFormulario();
  }

  eliminarClase(clase: Clase, dialog: TemplateRef<any>): void {
    this.claseEnEdicion = clase;
    this.dialogService.open(dialog, { context: clase });
  }

  async confirmarEliminar(ref: any): Promise<void> {
    if (this.claseEnEdicion) {
      const result = await this.entrenadorFirebase.eliminarClase(this.claseEnEdicion.id);
      if (result.success) {
        this.toastrService.success(result.message, 'Éxito');
      } else {
        this.toastrService.danger(result.message, 'Error');
      }
    }
    ref.close();
  }

  async toggleActiva(clase: Clase): Promise<void> {
    const result = await this.entrenadorFirebase.actualizarClase(clase.id, {
      activa: !clase.activa
    });

    if (result.success) {
      const estado = !clase.activa ? 'activada' : 'desactivada';
      this.toastrService.info(`Clase ${estado}`, 'Información');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.claseEnEdicion = null;
    this.claseForm.reset();
  }

  get descripcionLength(): number {
    return this.claseForm.get('descripcion')?.value?.length || 0;
  }
}

