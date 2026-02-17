import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'sc-admin-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🏋️</span>
            <span class="logo-text">Sportconnecta</span>
            <span class="logo-badge">Admin</span>
          </div>
          <h1>Panel de Administración</h1>
          <p>Ingresa tus credenciales de administrador</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Email de Administrador</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="admin@sportconnecta.com"
              class="form-input"
            />
            <small class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Email requerido
            </small>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              formControlName="password" 
              placeholder="••••••••"
              class="form-input"
            />
            <small class="error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Contraseña requerida (mín. 6 caracteres)
            </small>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            [disabled]="form.invalid || loading"
            class="submit-btn"
            [class.loading]="loading"
          >
            {{ loading ? 'Verificando...' : 'Ingresar al Panel' }}
          </button>
        </form>

        <div class="demo-credentials">
          <p><strong>Credenciales de Demo:</strong></p>
          <code>admin@sportconnecta.com / admin123</code>
        </div>

        <div class="back-link">
          <a href="http://localhost:4200">← Volver a Sportconnecta</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a7b8a 0%, #00d9a5 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #222b45;
    }

    .logo-badge {
      background: linear-gradient(135deg, #00d9a5, #0a7b8a);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .login-header h1 {
      margin: 0 0 8px;
      font-size: 1.5rem;
      color: #222b45;
    }

    .login-header p {
      margin: 0;
      color: #8f9bb3;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #222b45;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e4e9f2;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #00d9a5;
    }

    .error {
      color: #ff3d71;
      font-size: 0.8rem;
      margin-top: 4px;
      display: block;
    }

    .error-message {
      background: #fff5f5;
      border: 1px solid #ff3d71;
      color: #ff3d71;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #00d9a5, #0a7b8a);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 217, 165, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .submit-btn.loading {
      pointer-events: none;
    }

    .demo-credentials {
      margin-top: 24px;
      padding: 16px;
      background: #f7f9fc;
      border-radius: 8px;
      text-align: center;
    }

    .demo-credentials p {
      margin: 0 0 8px;
      font-size: 0.85rem;
      color: #8f9bb3;
    }

    .demo-credentials code {
      background: #e4e9f2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #222b45;
    }

    .back-link {
      margin-top: 24px;
      text-align: center;
    }

    .back-link a {
      color: #00d9a5;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .back-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  // Credenciales de demo para admin
  private demoCredentials = {
    email: 'admin@sportconnecta.com',
    password: 'admin123'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    // Simular verificación de credenciales
    setTimeout(() => {
      if (email === this.demoCredentials.email && password === this.demoCredentials.password) {
        // Guardar token simulado
        localStorage.setItem('admin_token', 'demo_admin_token_' + Date.now());
        localStorage.setItem('admin_user', JSON.stringify({
          id: 1,
          name: 'Administrador',
          email: email,
          role: 'ADMIN'
        }));
        
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage = 'Credenciales incorrectas. Usa las credenciales de demo.';
      }
      this.loading = false;
    }, 1000);
  }
}
