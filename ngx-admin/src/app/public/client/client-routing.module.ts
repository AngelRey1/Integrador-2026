import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrenadoresListComponent } from '../entrenadores-list/entrenadores-list.component';
import { EntrenadorPerfilComponent } from '../entrenador-perfil/entrenador-perfil.component';

const routes: Routes = [
  {
    path: 'entrenadores',
    component: EntrenadoresListComponent,
  },
  {
    path: 'entrenador/:id',
    component: EntrenadorPerfilComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
