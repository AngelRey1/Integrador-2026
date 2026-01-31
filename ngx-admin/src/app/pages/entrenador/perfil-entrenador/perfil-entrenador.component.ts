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
      experiencia: [{ value: 0, disabled: true }, Validators.required],
      precio: [{ value: 500, disabled: true }, Validators.required]
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

        this.perfilForm.patchValue({
          nombre: perfil.nombre,
          apellidoPaterno: perfil.apellidoPaterno,
          bio: perfil.bio || '',
          experiencia: this.calcularExperiencia(perfil.fechaRegistro),
          precio: perfil.precio || 500
        });
      }
      this.loading = false;
    });
  }

  private calcularExperiencia(fechaRegistro?: Date): number {
    if (!fechaRegistro) return 0;
    const fecha = fechaRegistro instanceof Date
      ? fechaRegistro
      : new Date((fechaRegistro as any)?.seconds * 1000);
    const años = new Date().getFullYear() - fecha.getFullYear();
    return Math.max(1, años);
  }

  toggleEditar(): void {
    this.editando = !this.editando;
    if (this.editando) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
    }
  }

  async guardar(): Promise<void> {
    if (this.perfilForm.valid) {
      this.guardando = true;
      const formValue = this.perfilForm.value;

      const result = await this.entrenadorFirebase.actualizarPerfil({
        nombre: formValue.nombre,
        apellidoPaterno: formValue.apellidoPaterno,
        bio: formValue.bio,
        precio: formValue.precio
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
}

