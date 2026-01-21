import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClienteDashboardComponent } from './cliente-dashboard/cliente-dashboard.component';
import { BuscarEntrenadoresComponent } from './buscar-entrenadores/buscar-entrenadores.component';
import { AgendarSesionComponent } from './agendar-sesion/agendar-sesion.component';
import { MisReservasComponent } from './mis-reservas/mis-reservas.component';
import { MisPagosComponent } from './mis-pagos/mis-pagos.component';
import { MisResenasComponent } from './mis-resenas/mis-resenas.component';
import { PerfilClienteComponent } from './perfil-cliente/perfil-cliente.component';
import { CatalogosClienteComponent } from './catalogos-cliente/catalogos-cliente.component';

// Nebular Modules
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbInputModule,
  NbBadgeModule,
  NbSelectModule,
  NbDatepickerModule,
  NbTabsetModule,
  NbStepperModule,
  NbListModule,
  NbAccordionModule,
  NbProgressBarModule,
  NbCheckboxModule,
  NbRadioModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbAlertModule,
  NbDialogModule,
  NbToggleModule
} from '@nebular/theme';

import { ClienteRoutingModule } from './cliente-routing.module';

@NgModule({
  declarations: [
    ClienteDashboardComponent,
    BuscarEntrenadoresComponent,
    AgendarSesionComponent,
    MisReservasComponent,
    MisPagosComponent,
    MisResenasComponent,
    CatalogosClienteComponent,
    PerfilClienteComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClienteRoutingModule,
    // Nebular Modules
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbBadgeModule,
    NbSelectModule,
    NbDatepickerModule,
    NbTabsetModule,
    NbStepperModule,
    NbListModule,
    NbAccordionModule,
    NbProgressBarModule,
    NbCheckboxModule,
    NbRadioModule,
    NbTooltipModule,
    NbSpinnerModule,
    NbAlertModule,
    NbDialogModule.forChild(),
    NbToggleModule
  ],
  exports: [ClienteDashboardComponent, BuscarEntrenadoresComponent]
})
export class ClienteModule {}
