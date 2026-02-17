import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrenadorDashboardComponent } from './entrenador-dashboard/entrenador-dashboard.component';
import { GestionClasesComponent } from './gestion-clases/gestion-clases.component';
import { CalendarioDisponibilidadComponent } from './calendario-disponibilidad/calendario-disponibilidad.component';
import { MisClientesComponent } from './mis-clientes/mis-clientes.component';
import { MisIngresosComponent } from './mis-ingresos/mis-ingresos.component';
import { PerfilEntrenadorComponent } from './perfil-entrenador/perfil-entrenador.component';
import { ChatEntrenadorComponent } from './chat/chat.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: EntrenadorDashboardComponent
  },
  {
    path: 'gestion-clases',
    component: GestionClasesComponent
  },
  {
    path: 'calendario',
    component: CalendarioDisponibilidadComponent
  },
  {
    path: 'calendario-disponibilidad',
    redirectTo: 'calendario',
    pathMatch: 'full'
  },
  {
    path: 'mis-clientes',
    component: MisClientesComponent
  },
  {
    path: 'mis-ingresos',
    component: MisIngresosComponent
  },
  {
    path: 'chat',
    component: ChatEntrenadorComponent
  },
  {
    path: 'perfil',
    component: PerfilEntrenadorComponent
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntrenadorRoutingModule { }
