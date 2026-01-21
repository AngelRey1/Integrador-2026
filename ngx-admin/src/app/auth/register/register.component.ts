import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../@core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
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
            <input formControlName="contrasena" type="password" placeholder="Contraseña (mínimo 6 caracteres)" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('contrasena')?.invalid && form.get('contrasena')?.touched">
              <span *ngIf="form.get('contrasena')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="form.get('contrasena')?.errors?.['minlength']">Mínimo 6 caracteres</span>
            </small>
          </div>
          <div style="margin-bottom: 15px;">
            <input formControlName="confirmar_contrasena" type="password" placeholder="Confirmar Contraseña" style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; box-sizing: border-box;" />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('confirmar_contrasena')?.invalid && form.get('confirmar_contrasena')?.touched">
              Debes confirmar la contraseña
            </small>
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.errors?.['mismatch'] && form.get('confirmar_contrasena')?.touched">
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
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('rol')?.invalid && form.get('rol')?.touched">
              <span *ngIf="form.get('rol')?.errors?.['required']">Debes seleccionar un rol</span>
            </small>
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
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contrasena: ['', Validators.required],
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
    const p = group.get('contrasena')?.value;
    const c = group.get('confirmar_contrasena')?.value;
    return p === c ? null : { mismatch: true };
  }

  submit() {
    // Marcar todos los campos como touched para mostrar errores
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.register(this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.errorMessage = '';
        const nombreUsuario = res?.user?.nombreUsuario || 'usuario';
        const email = res?.user?.email || this.form.value.email;
        const estado = res?.user?.estado;
        
        if (estado === 'PENDIENTE') {
          // Si es entrenador y está pendiente
          this.successMessage = `¡Registro exitoso! Tu nombre de usuario es: ${nombreUsuario}. Tu solicitud será revisada en 2-3 días hábiles. Te notificaremos por email.`;
          
          setTimeout(() => {
            this.router.navigate(['/auth/pendiente-aprobacion']);
          }, 3000);
        } else {
          // Si es cliente (activo inmediatamente)
          this.successMessage = `¡Registro exitoso! Tu nombre de usuario es: ${nombreUsuario}. Redirigiendo al login...`;
          
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: {
                email: email,
                nombreUsuario: nombreUsuario
              }
            });
          }, 2000);
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.successMessage = '';
        // Extraer el mensaje de error correctamente
        let errorMsg = 'Error al registrar. Por favor, intenta nuevamente.';
        
        if (error) {
          if (typeof error === 'string') {
            errorMsg = error;
          } else if (error.message) {
            errorMsg = error.message;
          } else if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          }
        }
        
        this.errorMessage = errorMsg;
        console.error('Error en registro:', error);
      }
    });
  }
}
