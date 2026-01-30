import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./pages/usuarios/usuarios.module').then(m => m.UsuariosModule),
      },
      {
        path: 'entrenadores',
        loadChildren: () => import('./pages/entrenadores/entrenadores.module').then(m => m.EntrenadoresModule),
      },
      {
        path: 'deportes',
        loadChildren: () => import('./pages/deportes/deportes.module').then(m => m.DeportesModule),
      },
      {
        path: 'reservas',
        loadChildren: () => import('./pages/reservas/reservas.module').then(m => m.ReservasModule),
      },
      {
        path: 'pagos',
        loadChildren: () => import('./pages/pagos/pagos.module').then(m => m.PagosModule),
      },
      {
        path: 'reportes',
        loadChildren: () => import('./pages/reportes/reportes.module').then(m => m.ReportesModule),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
