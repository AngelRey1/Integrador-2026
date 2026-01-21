import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';

interface Clase {
  id: number;
  nombre: string;
  deporte: string;
  descripcion: string;
  modalidad: 'presencial' | 'online' | 'ambas';
  duracion: number;
  precio: number;
  cupo_maximo: number;
  ubicacion?: string;
  nivel: string;
  activa: boolean;
}

@Component({
  selector: 'ngx-gestion-clases',
  templateUrl: './gestion-clases.component.html',
  styleUrls: ['./gestion-clases.component.scss']
})
export class GestionClasesComponent implements OnInit {
  claseForm: FormGroup;
  clases: Clase[] = [];
  claseEnEdicion: Clase | null = null;
  mostrarFormulario = false;

  deportesDisponibles = ['Yoga', 'Pilates', 'CrossFit', 'Running', 'Natación', 'Boxeo', 'Ciclismo'];
  nivelesDisponibles = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {
    this.claseForm = this.fb.group({
      nombre: ['', Validators.required],
      deporte: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]],
      modalidad: ['presencial', Validators.required],
      duracion: [60, [Validators.required, Validators.min(15)]],
      precio: [30, [Validators.required, Validators.min(5)]],
      cupo_maximo: [10, [Validators.required, Validators.min(1)]],
      ubicacion: [''],
      nivel: ['Todos los niveles', Validators.required],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases(): void {
    this.clases = [
      {
        id: 1,
        nombre: 'Yoga Integral',
        deporte: 'Yoga',
        descripcion: 'Sesión completa de yoga para todos los niveles, enfocada en flexibilidad y relajación.',
        modalidad: 'ambas',
        duracion: 60,
        precio: 30,
        cupo_maximo: 12,
        ubicacion: 'Estudio Central',
        nivel: 'Todos los niveles',
        activa: true
      },
      {
        id: 2,
        nombre: 'CrossFit Intenso',
        deporte: 'CrossFit',
        descripcion: 'Entrenamiento de alta intensidad para mejorar resistencia y fuerza.',
        modalidad: 'presencial',
        duracion: 90,
        precio: 45,
        cupo_maximo: 8,
        ubicacion: 'Box Principal',
        nivel: 'Avanzado',
        activa: true
      },
      {
        id: 3,
        nombre: 'Pilates Online',
        deporte: 'Pilates',
        descripcion: 'Clase online de pilates mat work, ideal para fortalecer el core.',
        modalidad: 'online',
        duracion: 50,
        precio: 25,
        cupo_maximo: 20,
        nivel: 'Intermedio',
        activa: true
      }
    ];
  }

  nuevaClase(): void {
    this.claseEnEdicion = null;
    this.claseForm.reset({
      modalidad: 'presencial',
      duracion: 60,
      precio: 30,
      cupo_maximo: 10,
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

  guardarClase(): void {
    if (this.claseForm.invalid) {
      Object.keys(this.claseForm.controls).forEach(key => {
        this.claseForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.claseForm.value;

    if (this.claseEnEdicion) {
      const index = this.clases.findIndex(c => c.id === this.claseEnEdicion!.id);
      if (index !== -1) {
        this.clases[index] = { ...this.clases[index], ...formValue };
        this.toastrService.success('Clase actualizada correctamente', 'Éxito');
      }
    } else {
      const nuevaClase: Clase = {
        id: Math.max(...this.clases.map(c => c.id), 0) + 1,
        ...formValue
      };
      this.clases.unshift(nuevaClase);
      this.toastrService.success('Clase creada correctamente', 'Éxito');
    }

    this.cancelarFormulario();
  }

  eliminarClase(clase: Clase, dialog: TemplateRef<any>): void {
    this.claseEnEdicion = clase;
    this.dialogService.open(dialog, { context: clase });
  }

  confirmarEliminar(ref: any): void {
    if (this.claseEnEdicion) {
      this.clases = this.clases.filter(c => c.id !== this.claseEnEdicion!.id);
      this.toastrService.success('Clase eliminada correctamente', 'Éxito');
    }
    ref.close();
  }

  toggleActiva(clase: Clase): void {
    clase.activa = !clase.activa;
    const estado = clase.activa ? 'activada' : 'desactivada';
    this.toastrService.info(`Clase ${estado}`, 'Información');
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
