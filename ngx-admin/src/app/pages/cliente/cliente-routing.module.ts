import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteDashboardComponent } from './cliente-dashboard/cliente-dashboard.component';
import { BuscarEntrenadoresComponent } from './buscar-entrenadores/buscar-entrenadores.component';
import { AgendarSesionComponent } from './agendar-sesion/agendar-sesion.component';
import { MisReservasComponent } from './mis-reservas/mis-reservas.component';
import { MisPagosComponent } from './mis-pagos/mis-pagos.component';
import { MisResenasComponent } from './mis-resenas/mis-resenas.component';
import { PerfilClienteComponent } from './perfil-cliente/perfil-cliente.component';
import { CatalogosClienteComponent } from './catalogos-cliente/catalogos-cliente.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',  // Ahora es "Inicio" - vista unificada
        component: ClienteDashboardComponent
      },
      {
        path: 'buscar-entrenadores',  // Mantener por si hay enlaces directos
        component: BuscarEntrenadoresComponent
      },
      {
        path: 'agendar-sesion',
        component: AgendarSesionComponent
      },
      {
        path: 'agendar-sesion/:id',
        component: AgendarSesionComponent
      },
      {
        path: 'mis-reservas',  // Ahora es "Mis Sesiones"
        component: MisReservasComponent
      },
      {
        path: 'mis-pagos',
        component: MisPagosComponent
      },
      {
        path: 'mis-resenas',
        component: MisResenasComponent
      },
      {
        path: 'chat',
        component: ChatComponent
      },
      {
        path: 'catalogos',  // Oculto del menú pero accesible
        component: CatalogosClienteComponent
      },
      {
        path: 'perfil',
        component: PerfilClienteComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',  // Inicio como home
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
