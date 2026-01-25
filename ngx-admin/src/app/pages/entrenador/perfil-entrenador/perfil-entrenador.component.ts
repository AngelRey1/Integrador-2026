import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-perfil-entrenador',
  templateUrl: './perfil-entrenador.component.html',
  styleUrls: ['./perfil-entrenador.component.scss']
})
export class PerfilEntrenadorComponent {
  perfilForm: FormGroup;
  editando = false;

  especialidades = ['Yoga', 'Pilates', 'CrossFit', 'Running'];
  certificaciones = ['Certificación en Yoga - 2020', 'Nutrición Deportiva - 2019'];

  constructor(
    private fb: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.perfilForm = this.fb.group({
      nombre: [{ value: 'Ana Pérez García', disabled: true }, Validators.required],
      bio: [{ value: 'Entrenadora certificada con 10 años de experiencia en yoga y pilates.', disabled: true }],
      experiencia: [{ value: 10, disabled: true }, Validators.required],
      tarifa_base: [{ value: 30, disabled: true }, Validators.required]
    });
  }

  toggleEditar(): void {
    this.editando = !this.editando;
    if (this.editando) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
    }
  }

  guardar(): void {
    if (this.perfilForm.valid) {
      this.toastrService.success('Perfil actualizado', 'Éxito');
      this.toggleEditar();
    }
  }
}
