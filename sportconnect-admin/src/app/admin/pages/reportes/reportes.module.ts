import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    RouterModule.forChild(routes),
  ],
})
export class ReportesModule { }
