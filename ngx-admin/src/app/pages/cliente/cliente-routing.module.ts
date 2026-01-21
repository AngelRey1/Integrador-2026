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

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: ClienteDashboardComponent
      },
      {
        path: 'buscar-entrenadores',
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
        path: 'mis-reservas',
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
        path: 'catalogos',
        component: CatalogosClienteComponent
      },
      {
        path: 'perfil',
        component: PerfilClienteComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
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
