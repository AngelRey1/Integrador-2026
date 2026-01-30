import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../@core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'ngx-login',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 40px; max-width: 400px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <h2 style="text-align: center; margin-bottom: 10px; color: #2c3e50;">Iniciar Sesión</h2>
        <p style="text-align: center; color: #7b8a8b; margin-bottom: 30px;">Ingresa tus credenciales</p>
        
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Email o Nombre de Usuario *</label>
            <input 
              type="text" 
              formControlName="email" 
              placeholder="tu@email.com o nombre_usuario"
              style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; font-size: 1rem; box-sizing: border-box;"
            />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              <span *ngIf="form.get('email')?.errors?.['required']">El email o nombre de usuario es requerido</span>
            </small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Contraseña</label>
            <input 
              type="password" 
              formControlName="contrasena" 
              placeholder="••••••••"
              style="width: 100%; padding: 10px; border: 1px solid #e4e9f2; border-radius: 4px; font-size: 1rem; box-sizing: border-box;"
            />
            <small style="color: red; font-size: 0.85rem;" *ngIf="form.get('contrasena')?.invalid && form.get('contrasena')?.touched">
              <span *ngIf="form.get('contrasena')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="form.get('contrasena')?.errors?.['minlength']">Mínimo 6 caracteres</span>
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
            <small style="color: red; font-size: 0.85rem; margin-top: 5px; display: block;" *ngIf="form.get('rol')?.invalid && form.get('rol')?.touched">
              <span *ngIf="form.get('rol')?.errors?.['required']">Debes seleccionar un rol</span>
            </small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" formControlName="recordar" style="margin-right: 8px;" />
              <span>Recordar sesión</span>
            </label>
          </div>

          <div style="color: red; margin-bottom: 15px; padding: 10px; background: #fff5f5; border: 1px solid #ff6b6b; border-radius: 4px;" *ngIf="errorMessage">
            {{ errorMessage }}
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

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializar formulario en el constructor para evitar problemas de timing
    // El campo email puede ser email o nombre de usuario
    // Y un selector de rol para elegir cómo entrar
    this.form = this.fb.group({
      email: ['', [Validators.required]], // Puede ser email o nombreUsuario
      nombreUsuario: [''], // Se llenará automáticamente si se ingresa email
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['CLIENTE', [Validators.required]], // Selector de rol: CLIENTE, ENTRENADOR o ADMIN
      recordar: [false]
    });
  }

  ngOnInit() {
    // Verificar si hay parámetros de query (viene del registro)
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const nombreUsuario = params['nombreUsuario'];
      
      if (email) {
        this.form.patchValue({ email: email });
      }
      if (nombreUsuario) {
        // Limpiar mensajes de error si viene del registro
        this.errorMessage = '';
      }
    });

    // Verificar si ya está autenticado después de un pequeño delay
    setTimeout(() => {
      try {
        if (this.auth && this.auth.token) {
          this.redirectByRole();
        }
      } catch (error) {
        console.warn('Error verificando autenticación:', error);
      }
    }, 300);
  }

  submit() {
    if (this.form.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Preparar datos para login: el campo email puede contener email o nombreUsuario
    const loginData = {
      email: this.form.value.email.trim(),
      nombreUsuario: this.form.value.email.trim(), // Usar el mismo valor para ambos
      contrasena: this.form.value.contrasena,
      rol: this.form.value.rol
    };

    // El servicio ahora maneja automáticamente el fallback a localStorage
    this.auth.login(loginData).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (res: any) => {
        // Esperar un momento para que el token se guarde
        setTimeout(() => {
          this.redirectByRole();
        }, 100);
      },
      error: (error) => {
        // Manejar errores especiales de estado
        if (error.code === 'PENDING_APPROVAL') {
          this.router.navigate(['/auth/pendiente-aprobacion']);
          return;
        }
        
        if (error.code === 'ACCOUNT_REJECTED') {
          this.router.navigate(['/auth/solicitud-rechazada']);
          return;
        }
        
        this.errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales y el rol seleccionado.';
        console.error('Error en login:', error);
      }
    });
  }

  private redirectByRole() {
    const role = this.auth.getRole();
    
    if (!role) {
      // Si no hay rol, redirigir al login
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Normalizar el rol a minúsculas para comparación
    const roleLower = role.toLowerCase();
    
    // Redirigir según el rol del usuario autenticado
    // El rol se obtiene automáticamente del token JWT
    if (roleLower === 'cliente' || roleLower === 'client') {
      this.router.navigate(['/pages/cliente/dashboard']);
    } else if (roleLower === 'entrenador' || roleLower === 'trainer') {
      this.router.navigate(['/pages/entrenador/dashboard']);
    } else if (roleLower === 'admin' || roleLower === 'administrador' || roleLower === 'administrator') {
      // Los admins acceden a sportconnect-admin en puerto 4300
      window.location.href = 'http://localhost:4300/admin/dashboard';
    } else {
      // Si el rol no es reconocido, redirigir a cliente por defecto
      this.router.navigate(['/pages/cliente/dashboard']);
    }
  }

}
