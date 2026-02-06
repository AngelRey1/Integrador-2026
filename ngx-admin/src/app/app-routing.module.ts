import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './@core/guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { PendienteAprobacionComponent } from './auth/pendiente-aprobacion/pendiente-aprobacion.component';
import { SolicitudRechazadaComponent } from './auth/solicitud-rechazada/solicitud-rechazada.component';
import { CuentaAprobadaComponent } from './auth/cuenta-aprobada/cuenta-aprobada.component';

export const routes: Routes = [
  // Ruta pública - Landing Page (SIN AuthGuard)
  {
    path: '',
    loadChildren: () => import('./public/public.module')
      .then(m => m.PublicModule),
  },
  // Panel protegido (clientes/entrenadores)
  {
    path: 'pages',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  // Autenticación (oculto de landing, solo acceso directo)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'pendiente-aprobacion',
        component: PendienteAprobacionComponent,
      },
      {
        path: 'solicitud-rechazada',
        component: SolicitudRechazadaComponent,
      },
      {
        path: 'cuenta-aprobada',
        component: CuentaAprobadaComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  { 
    path: '**', 
    redirectTo: '/' 
  },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
