import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { PagosListComponent } from './pagos-list/pagos-list.component';

const routes: Routes = [
  {
    path: '',
    component: PagosListComponent,
  },
];

@NgModule({
  declarations: [
    PagosListComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
  ],
})
export class PagosModule { }
