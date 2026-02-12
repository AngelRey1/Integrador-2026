import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordar: [false]
    });
  }

  ngOnInit() {
    // Verificar si hay parámetros de query (viene del registro)
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.form.patchValue({ email: params['email'] });
      }
      if (params['registered']) {
        this.successMessage = '¡Registro exitoso! Ya puedes iniciar sesión.';
      }
      if (params['pending']) {
        this.successMessage = 'Tu cuenta de entrenador está pendiente de aprobación. Te notificaremos pronto.';
      }
    });

    // Verificar si ya está autenticado
    if (this.authFirebase.isAuthenticated()) {
      this.redirectByRole();
    }
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

    const { email, password } = this.form.value;
    const rol = 'ENTRENADOR'; // Login siempre como entrenador

    const result = await this.authFirebase.login(email, password, rol);

    this.loading = false;

    if (result.success) {
      this.redirectByRole();
    } else {
      this.errorMessage = result.message;
    }
  }

  async forgotPassword() {
    const email = this.form.get('email')?.value;

    if (!email) {
      this.errorMessage = 'Ingresa tu email primero';
      return;
    }

    this.loading = true;
    const result = await this.authFirebase.resetPassword(email);
    this.loading = false;

    if (result.success) {
      this.successMessage = result.message;
      this.errorMessage = '';
    } else {
      this.errorMessage = result.message;
    }
  }

  private redirectByRole() {
    const role = this.authFirebase.getRole();

    if (!role) {
      return;
    }

    const roleLower = role.toLowerCase();

    if (roleLower === 'cliente') {
      this.router.navigate(['/pages/cliente/dashboard']);
    } else if (roleLower === 'entrenador') {
      this.router.navigate(['/pages/entrenador/dashboard']);
    } else if (roleLower === 'admin') {
      window.location.href = 'http://localhost:4300/admin/dashboard';
    } else {
      this.router.navigate(['/pages/cliente/dashboard']);
    }
  }
}

