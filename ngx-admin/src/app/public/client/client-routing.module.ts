import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrenadoresListComponent } from '../entrenadores-list/entrenadores-list.component';
import { EntrenadorPerfilComponent } from '../entrenador-perfil/entrenador-perfil.component';
import { ReservaModalComponent } from '../reserva-modal/reserva-modal.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EntrenadoresListComponent,
      },
      {
        path: 'reservar/:id',
        component: ReservaModalComponent,
      },
      {
        path: ':id',
        component: EntrenadorPerfilComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule { }
