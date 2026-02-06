import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-login',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 40px; max-width: 400px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <h2 style="text-align: center; margin-bottom: 10px; color: #2c3e50;">Iniciar Sesión</h2>
        <p style="text-align: center; color: #7b8a8b; margin-bottom: 30px;">Ingresa tus credenciales</p>
        
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Email *</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="tu@email.com"
              style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; font-size: 1rem; box-sizing: border-box;"
            />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              <span *ngIf="form.get('email')?.errors?.['required']">El email es requerido</span>
              <span *ngIf="form.get('email')?.errors?.['email']">Email no válido</span>
            </small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Contraseña</label>
            <input 
              type="password" 
              formControlName="password" 
              placeholder="••••••••"
              style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; font-size: 1rem; box-sizing: border-box;"
            />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              <span *ngIf="form.get('password')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="form.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</span>
            </small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Entrar como *</label>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <label style="display: flex; align-items: center; cursor: pointer; padding: 12px 16px; border: 2px solid #e4e9f2; border-radius: 8px; flex: 1; min-width: 140px; transition: all 0.3s;" [style.border-color]="form.get('rol')?.value === 'CLIENTE' ? '#00d9a5' : '#e4e9f2'" [style.background]="form.get('rol')?.value === 'CLIENTE' ? '#e6fff8' : 'white'">
                <input type="radio" formControlName="rol" value="CLIENTE" style="margin-right: 10px;" />
                <div>
                  <div style="font-weight: 600; color: #2c3e50;">🏃‍♂️ Cliente</div>
                  <small style="color: #7b8a8b; font-size: 0.7rem;">Buscar entrenadores</small>
                </div>
              </label>
              <label style="display: flex; align-items: center; cursor: pointer; padding: 12px 16px; border: 2px solid #e4e9f2; border-radius: 8px; flex: 1; min-width: 140px; transition: all 0.3s;" [style.border-color]="form.get('rol')?.value === 'ENTRENADOR' ? '#00d9a5' : '#e4e9f2'" [style.background]="form.get('rol')?.value === 'ENTRENADOR' ? '#e6fff8' : 'white'">
                <input type="radio" formControlName="rol" value="ENTRENADOR" style="margin-right: 10px;" />
                <div>
                  <div style="font-weight: 600; color: #2c3e50;">💪 Entrenador</div>
                  <small style="color: #7b8a8b; font-size: 0.7rem;">Ofrecer servicios</small>
                </div>
              </label>
            </div>
          </div>

          <div style="color: red; margin-bottom: 15px; padding: 10px; background: #fff5f5; border: 1px solid #ff6b6b; border-radius: 4px;" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div style="color: #22c55e; margin-bottom: 15px; padding: 10px; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 4px;" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button 
            type="submit"
            [disabled]="form.invalid || loading"
            style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 20px;"
            [style.opacity]="(form.invalid || loading) ? '0.6' : '1'"
            [style.cursor]="(form.invalid || loading) ? 'not-allowed' : 'pointer'"
          >
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>

          <div style="text-align: center; margin-bottom: 15px;">
            <a (click)="forgotPassword()" style="color: #667eea; text-decoration: none; font-size: 0.9rem; cursor: pointer;">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e4e9f2;">
            <p style="margin: 0; color: #7b8a8b; font-size: 0.9rem;">
              ¿No tienes cuenta? <a routerLink="/auth/register" style="color: #667eea; text-decoration: none; font-weight: 500;">Regístrate aquí</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
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
      rol: ['CLIENTE', [Validators.required]]
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
        this.successMessage = 'Tu cuenta de entrenador está pendiente de aprobación.';
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

    const { email, password, rol } = this.form.value;

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

