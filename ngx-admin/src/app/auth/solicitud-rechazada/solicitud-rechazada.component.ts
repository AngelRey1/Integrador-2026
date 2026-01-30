import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../@core/services/auth.service';

@Component({
  selector: 'ngx-solicitud-rechazada',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
        
        <h2 style="color: #e53e3e; margin-bottom: 15px; font-size: 1.8rem;">Solicitud No Aprobada</h2>
        
        <p style="color: #7b8a8b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">
          Lamentablemente, tu solicitud para ser <strong>Entrenador</strong> no fue aprobada en esta ocasión.
        </p>

        <div style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 20px; margin-bottom: 30px; text-align: left; border-radius: 4px;">
          <h3 style="color: #c53030; margin: 0 0 10px 0; font-size: 1rem;">📋 Motivo del Rechazo:</h3>
          <p style="color: #c53030; margin: 0; line-height: 1.6;">
            {{ motivoRechazo }}
          </p>
        </div>

        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #667eea; margin: 0; font-size: 0.95rem; line-height: 1.6;">
            <strong>💡 Puedes volver a aplicar:</strong><br/>
            Revisa los requisitos, actualiza tus documentos y envía una nueva solicitud.
          </p>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button (click)="volverAlInicio()" style="padding: 12px 30px; background: #e4e9f2; color: #2c3e50; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
            Volver al Inicio
          </button>
          <button (click)="contactarSoporte()" style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  `
})
export class SolicitudRechazadaComponent {
  motivoRechazo = 'Los documentos proporcionados no cumplen con los requisitos mínimos. Por favor, asegúrate de subir certificaciones válidas y documentos legibles.';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    // Cargar motivo del rechazo si existe
    const motivo = localStorage.getItem('rejected_reason');
    if (motivo) {
      this.motivoRechazo = motivo;
    }
  }

  volverAlInicio() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  contactarSoporte() {
    // Abrir email o chat de soporte
    window.location.href = 'mailto:soporte@sportconnect.com?subject=Consulta sobre solicitud rechazada';
  }
}
