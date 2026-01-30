import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../@core/services/auth.service';

@Component({
  selector: 'ngx-pendiente-aprobacion',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 20px;">⏳</div>
        
        <h2 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.8rem;">Solicitud en Revisión</h2>
        
        <p style="color: #7b8a8b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">
          Tu solicitud para ser <strong>Entrenador</strong> está siendo revisada por nuestro equipo.
        </p>

        <div style="background: #fff9e6; border-left: 4px solid #ffd93d; padding: 20px; margin-bottom: 30px; text-align: left; border-radius: 4px;">
          <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 1rem;">📋 Proceso de Aprobación:</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Revisión de documentos: 1-2 días</li>
            <li>Verificación de certificaciones: 1-2 días</li>
            <li>Notificación por email: Inmediata</li>
          </ul>
        </div>

        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #667eea; margin: 0; font-size: 0.95rem;">
            <strong>💡 Mientras tanto:</strong><br/>
            Te enviaremos un email a <strong>{{ userEmail }}</strong> cuando tu cuenta sea aprobada.
          </p>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button (click)="logout()" style="padding: 12px 30px; background: #e4e9f2; color: #2c3e50; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
            Cerrar Sesión
          </button>
          <button (click)="verificarEstado()" style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
            Verificar Estado
          </button>
        </div>
      </div>
    </div>
  `
})
export class PendienteAprobacionComponent {
  userEmail = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    // Intentar obtener email de localStorage (guardado en login)
    this.userEmail = localStorage.getItem('pending_user_email') || 'tu email registrado';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  verificarEstado() {
    // Aquí verificarías el estado actual en la base de datos
    // Por ahora solo recargamos
    window.location.reload();
  }
}
