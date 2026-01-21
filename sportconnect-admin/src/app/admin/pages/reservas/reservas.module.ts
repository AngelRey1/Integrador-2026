import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReservasListComponent } from './reservas-list/reservas-list.component';

const routes: Routes = [
  {
    path: '',
    component: ReservasListComponent,
  },
];

@NgModule({
  declarations: [
    ReservasListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class ReservasModule { }
