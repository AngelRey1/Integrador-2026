import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { AuthGuard } from '../@core/guards/auth.guard';
import { ClienteGuard } from '../@core/guards/cliente.guard';
import { EntrenadorGuard } from '../@core/guards/entrenador.guard';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    // Sportconnecta - Módulos personalizados
    {
      path: 'cliente',
      canActivate: [AuthGuard, ClienteGuard],
      loadChildren: () => import('./cliente/cliente.module')
        .then(m => m.ClienteModule),
    },
    {
      path: 'entrenador',
      canActivate: [AuthGuard, EntrenadorGuard],
      loadChildren: () => import('./entrenador/entrenador.module')
        .then(m => m.EntrenadorModule),
    },
    {
      path: '',
      redirectTo: 'cliente/dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
