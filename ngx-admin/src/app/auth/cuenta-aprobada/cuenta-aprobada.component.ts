import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-cuenta-aprobada',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
        
        <h2 style="color: #38a169; margin-bottom: 15px; font-size: 1.8rem;">¡Cuenta Aprobada!</h2>
        
        <p style="color: #7b8a8b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">
          ¡Felicidades! Tu solicitud para ser <strong>Entrenador</strong> ha sido aprobada.
        </p>

        <div style="background: #f0fff4; border-left: 4px solid #68d391; padding: 20px; margin-bottom: 30px; text-align: left; border-radius: 4px;">
          <h3 style="color: #2f855a; margin: 0 0 10px 0; font-size: 1rem;">✅ Próximos Pasos:</h3>
          <ul style="color: #2f855a; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Completa tu perfil de entrenador</li>
            <li>Configura tu disponibilidad horaria</li>
            <li>Establece tus tarifas</li>
            <li>¡Empieza a recibir solicitudes de clientes!</li>
          </ul>
        </div>

        <button (click)="irADashboard()" style="padding: 15px 40px; background: #38a169; color: white; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; width: 100%;">
          Ir a Mi Dashboard 🚀
        </button>
      </div>
    </div>
  `
})
export class CuentaAprobadaComponent {
  constructor(private router: Router) {}

  irADashboard() {
    this.router.navigate(['/pages/entrenador/dashboard']);
  }
}
