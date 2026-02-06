import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DeportesListComponent } from './deportes-list/deportes-list.component';

const routes: Routes = [
  {
    path: '',
    component: DeportesListComponent,
  },
];

@NgModule({
  declarations: [
    DeportesListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class DeportesModule { }
