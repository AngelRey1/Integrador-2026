import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-register',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <h2 style="text-align: center; margin-bottom: 30px; color: #2c3e50;">Registro</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div style="margin-bottom: 15px;">
            <input formControlName="nombre" placeholder="Nombre" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched">
              El nombre es requerido
            </small>
          </div>
          <div style="margin-bottom: 15px;">
            <input formControlName="apellido" placeholder="Apellido" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('apellido')?.invalid && form.get('apellido')?.touched">
              El apellido es requerido
            </small>
          </div>
          <div style="margin-bottom: 15px;">
            <input formControlName="email" type="email" placeholder="Email" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              <span *ngIf="form.get('email')?.errors?.['required']">El email es requerido</span>
              <span *ngIf="form.get('email')?.errors?.['email']">Email inválido</span>
            </small>
          </div>
          <div style="margin-bottom: 15px;">
            <input formControlName="password" type="password" placeholder="Contraseña (mínimo 6 caracteres)" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              <span *ngIf="form.get('password')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="form.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</span>
            </small>
          </div>
          <div style="margin-bottom: 15px;">
            <input formControlName="confirmPassword" type="password" placeholder="Confirmar Contraseña" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched">
              Debes confirmar la contraseña
            </small>
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.errors?.['mismatch'] && form.get('confirmPassword')?.touched">
              Las contraseñas no coinciden
            </small>
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Me registro como *</label>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
              <label style="display: flex; align-items: center; cursor: pointer; padding: 15px; border: 2px solid #e4e9f2; border-radius: 8px; flex: 1; min-width: 180px; transition: all 0.3s;" [style.border-color]="form.get('rol')?.value === 'CLIENTE' ? '#667eea' : '#e4e9f2'" [style.background]="form.get('rol')?.value === 'CLIENTE' ? '#f0f4ff' : 'white'">
                <input type="radio" formControlName="rol" value="CLIENTE" style="margin-right: 10px;" />
                <div>
                  <div style="font-weight: 600; color: #2c3e50;">🏃‍♂️ Cliente</div>
                  <small style="color: #7b8a8b; font-size: 0.8rem;">Buscar entrenadores</small>
                </div>
              </label>
              <label style="display: flex; align-items: center; cursor: pointer; padding: 15px; border: 2px solid #e4e9f2; border-radius: 8px; flex: 1; min-width: 180px; transition: all 0.3s;" [style.border-color]="form.get('rol')?.value === 'ENTRENADOR' ? '#667eea' : '#e4e9f2'" [style.background]="form.get('rol')?.value === 'ENTRENADOR' ? '#f0f4ff' : 'white'">
                <input type="radio" formControlName="rol" value="ENTRENADOR" style="margin-right: 10px;" />
                <div>
                  <div style="font-weight: 600; color: #2c3e50;">💪 Entrenador</div>
                  <small style="color: #7b8a8b; font-size: 0.8rem;">Ofrecer servicios</small>
                </div>
              </label>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: #fff9e6; border-left: 3px solid #ffd93d; border-radius: 4px;" *ngIf="form.get('rol')?.value === 'ENTRENADOR'">
              <small style="color: #856404;">⚠️ <strong>Nota:</strong> Si te registras como Entrenador, tu cuenta requerirá aprobación por nuestro equipo. Te notificaremos en 2-3 días hábiles.</small>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" formControlName="terminos" style="margin-right: 8px;" />
              <span>Acepto términos y condiciones</span>
            </label>
            <small style="color: red; font-size: 0.85rem; display: block; margin-top: 5px;" *ngIf="form.get('terminos')?.invalid && form.get('terminos')?.touched">
              Debes aceptar los términos y condiciones
            </small>
          </div>
          
          <div style="color: red; margin-bottom: 15px; padding: 10px; background: #fff5f5; border: 1px solid #ff6b6b; border-radius: 4px;" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          
          <div style="color: green; margin-bottom: 15px; padding: 10px; background: #f0fff4; border: 1px solid #48bb78; border-radius: 4px;" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            [disabled]="form.invalid || loading"
            style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 1rem; font-weight: 600; cursor: pointer;"
            [style.opacity]="(form.invalid || loading) ? '0.6' : '1'"
            [style.cursor]="(form.invalid || loading) ? 'not-allowed' : 'pointer'"
          >
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>
          <div style="text-align: center; margin-top: 20px;">
            <a routerLink="/auth/login" style="color: #667eea; text-decoration: none;">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  `,
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
      rol: ['CLIENTE', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    // Pre-seleccionar el rol si viene desde la landing page
    this.route.queryParams.subscribe(params => {
      if (params['tipo'] === 'CLIENTE' || params['tipo'] === 'ENTRENADOR') {
        this.form.patchValue({ rol: params['tipo'] });
      }
    });
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

    const { nombre, apellido, email, password, rol } = this.form.value;

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

      if (rol === 'ENTRENADOR') {
        // Entrenador: redirigir a página de pendiente
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { email, pending: true }
          });
        }, 3000);
      } else {
        // Cliente: redirigir al login
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { email, registered: true }
          });
        }, 2000);
      }
    } else {
      this.errorMessage = result.message;
    }
  }
}

