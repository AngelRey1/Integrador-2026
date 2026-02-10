import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService } from '../../../@core/services/entrenador-firebase.service';
import { Entrenador } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-perfil-entrenador',
  templateUrl: './perfil-entrenador.component.html',
  styleUrls: ['./perfil-entrenador.component.scss']
})
export class PerfilEntrenadorComponent implements OnInit, OnDestroy {
  perfilForm: FormGroup;
  editando = false;
  loading = true;
  guardando = false;

  perfil: Entrenador | null = null;
  especialidades: string[] = [];
  certificaciones: string[] = [];
  deportes: string[] = [];
  modalidades: string[] = [];

  // Para edición
  nuevaEspecialidad = '';
  nuevoDeporte = '';
  nuevaCertificacion = '';

  // Opciones disponibles
  deportesDisponibles = [
    'Fútbol', 'Básquetbol', 'Tenis', 'Natación', 'Running', 
    'Ciclismo', 'Yoga', 'Pilates', 'CrossFit', 'Boxeo',
    'Artes Marciales', 'Volleyball', 'Golf', 'Gimnasia',
    'Entrenamiento Funcional', 'Pesas', 'Cardio', 'Fitness General'
  ];

  modalidadesDisponibles = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' }
  ];

  private subscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private toastrService: NbToastrService,
    private entrenadorFirebase: EntrenadorFirebaseService
  ) {
    this.perfilForm = this.fb.group({
      nombre: [{ value: '', disabled: true }, Validators.required],
      apellidoPaterno: [{ value: '', disabled: true }],
      bio: [{ value: '', disabled: true }],
      precio: [{ value: 500, disabled: true }, [Validators.required, Validators.min(0)]],
      precioOnline: [{ value: 400, disabled: true }, [Validators.required, Validators.min(0)]],
      telefono: [{ value: '', disabled: true }],
      whatsapp: [{ value: '', disabled: true }],
      ciudad: [{ value: '', disabled: true }],
      activo: [{ value: true, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarPerfil(): void {
    this.loading = true;
    this.subscription = this.entrenadorFirebase.getMiPerfil().subscribe(perfil => {
      if (perfil) {
        this.perfil = perfil;
        this.especialidades = perfil.especialidades || [];
        this.certificaciones = perfil.certificaciones || [];
        this.deportes = perfil.deportes || [];
        this.modalidades = perfil.modalidades || [];

        this.perfilForm.patchValue({
          nombre: perfil.nombre,
          apellidoPaterno: perfil.apellidoPaterno,
          bio: perfil.bio || perfil.descripcion || '',
          precio: perfil.precio || 500,
          precioOnline: perfil.precioOnline || 400,
          telefono: perfil.telefono || '',
          whatsapp: perfil.whatsapp || '',
          ciudad: perfil.ubicacion?.ciudad || '',
          activo: perfil.activo !== false
        });
      }
      this.loading = false;
    });
  }

  toggleEditar(): void {
    this.editando = !this.editando;
    if (this.editando) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
      // Restaurar valores originales
      if (this.perfil) {
        this.especialidades = [...(this.perfil.especialidades || [])];
        this.certificaciones = [...(this.perfil.certificaciones || [])];
        this.deportes = [...(this.perfil.deportes || [])];
        this.modalidades = [...(this.perfil.modalidades || [])];
      }
    }
  }

  // Gestión de especialidades
  agregarEspecialidad(): void {
    const esp = this.nuevaEspecialidad.trim();
    if (esp && !this.especialidades.includes(esp)) {
      this.especialidades.push(esp);
      this.nuevaEspecialidad = '';
    }
  }

  eliminarEspecialidad(esp: string): void {
    this.especialidades = this.especialidades.filter(e => e !== esp);
  }

  // Gestión de deportes
  agregarDeporte(deporte: string): void {
    if (deporte && !this.deportes.includes(deporte)) {
      this.deportes.push(deporte);
    }
  }

  eliminarDeporte(deporte: string): void {
    this.deportes = this.deportes.filter(d => d !== deporte);
  }

  // Gestión de certificaciones
  agregarCertificacion(): void {
    const cert = this.nuevaCertificacion.trim();
    if (cert && !this.certificaciones.includes(cert)) {
      this.certificaciones.push(cert);
      this.nuevaCertificacion = '';
    }
  }

  eliminarCertificacion(cert: string): void {
    this.certificaciones = this.certificaciones.filter(c => c !== cert);
  }

  // Gestión de modalidades
  toggleModalidad(modalidad: string): void {
    if (this.modalidades.includes(modalidad)) {
      this.modalidades = this.modalidades.filter(m => m !== modalidad);
    } else {
      this.modalidades.push(modalidad);
    }
  }

  async guardar(): Promise<void> {
    if (this.perfilForm.valid) {
      this.guardando = true;
      const formValue = this.perfilForm.value;

      // Validar que tenga al menos un deporte y una modalidad
      if (this.deportes.length === 0) {
        this.toastrService.warning('Debes seleccionar al menos un deporte', 'Atención');
        this.guardando = false;
        return;
      }

      if (this.modalidades.length === 0) {
        this.toastrService.warning('Debes seleccionar al menos una modalidad', 'Atención');
        this.guardando = false;
        return;
      }

      const result = await this.entrenadorFirebase.actualizarPerfil({
        nombre: formValue.nombre,
        apellidoPaterno: formValue.apellidoPaterno,
        bio: formValue.bio,
        descripcion: formValue.bio, // Mantener sincronizado
        precio: formValue.precio,
        precioOnline: formValue.precioOnline,
        telefono: formValue.telefono,
        whatsapp: formValue.whatsapp,
        especialidades: this.especialidades,
        certificaciones: this.certificaciones,
        deportes: this.deportes,
        modalidades: this.modalidades,
        activo: formValue.activo,
        ubicacion: {
          ...this.perfil?.ubicacion,
          ciudad: formValue.ciudad
        }
      });

      if (result.success) {
        this.toastrService.success(result.message, 'Éxito');
        this.toggleEditar();
      } else {
        this.toastrService.danger(result.message, 'Error');
      }
      this.guardando = false;
    }
  }

  getDeportesDisponiblesFiltrados(): string[] {
    return this.deportesDisponibles.filter(d => !this.deportes.includes(d));
  }
}

