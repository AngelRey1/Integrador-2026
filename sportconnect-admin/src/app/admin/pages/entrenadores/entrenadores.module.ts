import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { 
  NbCardModule, NbIconModule, NbButtonModule, NbBadgeModule,
  NbUserModule, NbTooltipModule
} from '@nebular/theme';

import { EntrenadoresListComponent } from './entrenadores-list/entrenadores-list.component';

const routes: Routes = [
  {
    path: '',
    component: EntrenadoresListComponent,
  },
];

@NgModule({
  declarations: [
    EntrenadoresListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbBadgeModule,
    NbUserModule,
    NbTooltipModule,
  ],
})
export class EntrenadoresModule { }
