import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { EntrenadoresListComponent } from '../entrenadores-list/entrenadores-list.component';
import { EntrenadorPerfilComponent } from '../entrenador-perfil/entrenador-perfil.component';
import { ReservaModalComponent } from '../reserva-modal/reserva-modal.component';
import { ClientRoutingModule } from './client-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    EntrenadoresListComponent,
    EntrenadorPerfilComponent,
    ReservaModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbLayoutModule,
    NbIconModule,
    ClientRoutingModule,
    SharedModule,
  ],
})
export class ClientModule {}
