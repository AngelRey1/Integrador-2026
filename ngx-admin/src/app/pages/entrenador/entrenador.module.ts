import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EntrenadorRoutingModule } from './entrenador-routing.module';
import { EntrenadorDashboardComponent } from './entrenador-dashboard/entrenador-dashboard.component';
import { GestionClasesComponent } from './gestion-clases/gestion-clases.component';
import { CalendarioDisponibilidadComponent } from './calendario-disponibilidad/calendario-disponibilidad.component';
import { MisClientesComponent } from './mis-clientes/mis-clientes.component';
import { MisIngresosComponent } from './mis-ingresos/mis-ingresos.component';
import { PerfilEntrenadorComponent } from './perfil-entrenador/perfil-entrenador.component';

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
  NbListModule,
  NbAccordionModule,
  NbProgressBarModule,
  NbCheckboxModule,
  NbRadioModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbAlertModule,
  NbDialogModule,
  NbToggleModule,
  NbCalendarModule,
  NbCalendarRangeModule,
  NbToastrModule
} from '@nebular/theme';

@NgModule({
  declarations: [
    EntrenadorDashboardComponent,
    GestionClasesComponent,
    CalendarioDisponibilidadComponent,
    MisClientesComponent,
    MisIngresosComponent,
    PerfilEntrenadorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EntrenadorRoutingModule,
    // Nebular Modules
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbBadgeModule,
    NbSelectModule,
    NbDatepickerModule,
    NbTabsetModule,
    NbListModule,
    NbAccordionModule,
    NbProgressBarModule,
    NbCheckboxModule,
    NbRadioModule,
    NbTooltipModule,
    NbSpinnerModule,
    NbAlertModule,
    NbDialogModule.forChild(),
    NbToggleModule,
    NbCalendarModule,
    NbCalendarRangeModule,
    NbToastrModule.forRoot()
  ]
})
export class EntrenadorModule { }
