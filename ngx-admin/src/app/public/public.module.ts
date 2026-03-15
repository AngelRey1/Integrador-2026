import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./landing/landing.module').then((m) => m.LandingModule),
  },
  {
    path: 'coach-join',
    loadChildren: () =>
      import('./coach-join/coach-join.module').then((m) => m.CoachJoinModule),
  },
  {
    path: 'entrenador',
    loadChildren: () =>
      import('./client/client.module').then((m) => m.ClientModule),
  },
  {
    path: 'entrenadores',
    loadChildren: () =>
      import('./client/client.module').then((m) => m.ClientModule),
  },
  {
    path: 'legal',
    loadChildren: () =>
      import('./legal/legal.module').then((m) => m.LegalModule),
  },
  {
    path: 'terminos',
    redirectTo: 'legal/terminos',
    pathMatch: 'full'
  },
  {
    path: 'politicas-pago',
    redirectTo: 'legal/politicas-pago',
    pathMatch: 'full'
  },
  {
    path: 'privacidad',
    redirectTo: 'legal/privacidad',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () =>
      import('./landing/landing.module').then((m) => m.LandingModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicModule {}
