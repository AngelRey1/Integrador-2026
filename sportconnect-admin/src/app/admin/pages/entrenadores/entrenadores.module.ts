import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
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
  ],
})
export class EntrenadoresModule { }
