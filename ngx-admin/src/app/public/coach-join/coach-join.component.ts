import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-coach-join',
  templateUrl: './coach-join.component.html',
  styleUrls: ['./coach-join.component.scss']
})
export class CoachJoinComponent {
  pasosEntrenador = [
    {
      numero: '1',
      titulo: 'Publica tu perfil',
      descripcion: 'Elige disciplinas, zona de cobertura y agrega tu portafolio.'
    },
    {
      numero: '2',
      titulo: 'Recibe clientes verificados',
      descripcion: 'Te llegan solicitudes filtradas con pago seguro y chat directo.'
    },
    {
      numero: '3',
      titulo: 'Cobra sin fricción',
      descripcion: 'Define tus tarifas y cobra con respaldo, sin comisiones ocultas.'
    }
  ];

  constructor(private router: Router) {}

  irARegistro() {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.seleccionarPlan('free');
    }
  }

  seleccionarPlan(plan: string) {
    this.router.navigate(['/auth/register'], {
      queryParams: {
        role: 'coach',
        action: 'signup',
        plan: plan
      }
    });
  }

  volverAlInicio() {
    this.router.navigate(['/public']);
  }
}
