import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReportesListComponent } from './reportes-list/reportes-list.component';

const routes: Routes = [
  {
    path: '',
    component: ReportesListComponent,
  },
];

@NgModule({
  declarations: [
    ReportesListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class ReportesModule { }
