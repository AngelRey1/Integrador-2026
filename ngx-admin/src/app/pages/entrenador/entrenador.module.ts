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
import { ChatEntrenadorComponent } from './chat/chat.component';

// Custom Icons
import { SportIconsModule } from '../../@theme/components/sport-icons/sport-icons.module';

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
  NbToastrModule,
  NbTagModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  declarations: [
    EntrenadorDashboardComponent,
    GestionClasesComponent,
    CalendarioDisponibilidadComponent,
    MisClientesComponent,
    MisIngresosComponent,
    PerfilEntrenadorComponent,
    ChatEntrenadorComponent
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
    NbEvaIconsModule,
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
    NbToastrModule.forRoot(),
    NbTagModule
  ]
})
export class EntrenadorModule { }
