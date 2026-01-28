import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { EntrenadoresListComponent } from '../entrenadores-list/entrenadores-list.component';
import { EntrenadorPerfilComponent } from '../entrenador-perfil/entrenador-perfil.component';
import { ReservaModalComponent } from '../reserva-modal/reserva-modal.component';
import { ClientRoutingModule } from './client-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SportIconsModule } from '../../@theme/components/sport-icons/sport-icons.module';

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
    NbEvaIconsModule,
    ClientRoutingModule,
    SharedModule,
    SportIconsModule,
  ],
})
export class ClientModule {}
