import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { NbLayoutModule } from '@nebular/theme';
import { PublicHomeComponent } from './home/home.component';
import { EntrenadoresListComponent } from './entrenadores-list/entrenadores-list.component';
import { EntrenadorPerfilComponent } from './entrenador-perfil/entrenador-perfil.component';
import { SharedHeaderComponent } from './shared-header/shared-header.component';
import { SharedFooterComponent } from './shared-footer/shared-footer.component';
import { ReservaModalComponent } from './reserva-modal/reserva-modal.component';

const routes: Routes = [
  {
    path: '',
    component: PublicHomeComponent,
  },
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
  declarations: [
    PublicHomeComponent,
    EntrenadoresListComponent,
    EntrenadorPerfilComponent,
    SharedHeaderComponent,
    SharedFooterComponent,
    ReservaModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    NbLayoutModule,
    RouterModule.forChild(routes),
  ],
})
export class PublicModule { }
