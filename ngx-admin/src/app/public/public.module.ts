import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./landing/landing.module').then((m) => m.LandingModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./client/client.module').then((m) => m.ClientModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicModule {}
