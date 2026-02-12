import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authFirebase: AuthFirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    // No necesitamos pre-seleccionar rol ya que siempre es ENTRENADOR
  }

  passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  async submit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nombre, apellido, email, password } = this.form.value;
    const rol = 'ENTRENADOR'; // Siempre registrar como entrenador

    const result = await this.authFirebase.register({
      nombre,
      apellido,
      email,
      password,
      rol
    });

    this.loading = false;

    if (result.success) {
      this.successMessage = result.message;
      
      // Entrenador: redirigir a página de login con mensaje de pendiente
      setTimeout(() => {
        this.router.navigate(['/auth/login'], {
          queryParams: { email, pending: true }
        });
      }, 3000);
    } else {
      this.errorMessage = result.message;
    }
  }
}

