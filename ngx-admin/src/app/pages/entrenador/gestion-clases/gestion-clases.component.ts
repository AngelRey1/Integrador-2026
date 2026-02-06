import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService, Clase as ClaseFirebase } from '../../../@core/services/entrenador-firebase.service';
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

  deportesDisponibles = ['Yoga', 'Pilates', 'CrossFit', 'Running', 'Natación', 'Boxeo', 'Ciclismo'];
  nivelesDisponibles = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

  private subscription: Subscription | null = null;

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
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

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

