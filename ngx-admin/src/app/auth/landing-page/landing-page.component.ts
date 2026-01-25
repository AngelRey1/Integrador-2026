import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-landing-page',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 40px; max-width: 800px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px; font-size: 2.5rem;">Encuentra tu entrenador personal ideal</h1>
          <p style="color: #7b8a8b; font-size: 1.2rem;">Agenda sesiones de entrenamiento como pides un Uber</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
          <!-- Opción 1: Cliente -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: transform 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);" (click)="irARegistro('CLIENTE')">
            <div style="font-size: 3.5rem; margin-bottom: 15px;">🏃‍♂️</div>
            <h3 style="color: white; margin-bottom: 10px; font-size: 1.5rem;">Soy Cliente</h3>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px; font-size: 0.95rem;">Busca y agenda sesiones con entrenadores certificados</p>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; display: inline-block;">
              <span style="color: white; font-weight: 600;">Registro inmediato ✓</span>
            </div>
          </div>
          
          <!-- Opción 2: Entrenador -->
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: transform 0.3s; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);" (click)="irARegistro('ENTRENADOR')">
            <div style="font-size: 3.5rem; margin-bottom: 15px;">💪</div>
            <h3 style="color: white; margin-bottom: 10px; font-size: 1.5rem;">Soy Entrenador</h3>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px; font-size: 0.95rem;">Ofrece tus servicios y gana dinero entrenando</p>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; display: inline-block;">
              <span style="color: white; font-weight: 600;">Requiere aprobación ⏳</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #7b8a8b; font-size: 0.95rem;">¿Ya tienes cuenta? <a routerLink="/auth/login" style="color: #667eea; text-decoration: none; font-weight: 600;">Inicia sesión aquí</a></p>
        </div>

        <section style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #e4e9f2;">
          <h3 style="text-align: center; color: #2c3e50; margin-bottom: 30px; font-size: 1.8rem;">Cómo funciona</h3>
          <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <div style="background: #f7f9fc; border: 1px solid #e4e9f2; border-radius: 8px; padding: 30px; text-align: center; flex: 1; min-width: 150px; max-width: 200px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
              <h4 style="color: #2c3e50; margin-bottom: 10px;">Busca</h4>
              <p style="color: #7b8a8b; font-size: 0.9rem;">Encuentra el entrenador perfecto para ti</p>
            </div>
            <div style="background: #f7f9fc; border: 1px solid #e4e9f2; border-radius: 8px; padding: 30px; text-align: center; flex: 1; min-width: 150px; max-width: 200px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">📅</div>
              <h4 style="color: #2c3e50; margin-bottom: 10px;">Agenda</h4>
              <p style="color: #7b8a8b; font-size: 0.9rem;">Reserva tu sesión en el horario que prefieras</p>
            </div>
            <div style="background: #f7f9fc; border: 1px solid #e4e9f2; border-radius: 8px; padding: 30px; text-align: center; flex: 1; min-width: 150px; max-width: 200px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">💪</div>
              <h4 style="color: #2c3e50; margin-bottom: 10px;">Entrena</h4>
              <p style="color: #7b8a8b; font-size: 0.9rem;">Alcanza tus objetivos con tu entrenador</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  irARegistro(rol: 'CLIENTE' | 'ENTRENADOR') {
    // Redirigir al registro con el rol pre-seleccionado
    this.router.navigate(['/auth/register'], {
      queryParams: { tipo: rol }
    });
  }
}
