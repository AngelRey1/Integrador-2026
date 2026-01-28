import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { 
  NbCardModule, NbIconModule, NbButtonModule, NbInputModule,
  NbSelectModule, NbTableModule, NbBadgeModule, NbTooltipModule,
  NbSpinnerModule, NbTabsetModule, NbListModule, NbUserModule,
  NbProgressBarModule, NbTagModule, NbToggleModule, NbCheckboxModule
} from '@nebular/theme';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    
    // Nebular UI
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
    NbTableModule,
    NbBadgeModule,
    NbTooltipModule,
    NbSpinnerModule,
    NbTabsetModule,
    NbListModule,
    NbUserModule,
    NbProgressBarModule,
    NbTagModule,
    NbToggleModule,
    NbCheckboxModule
  ]
})
export class AdminModule { }
