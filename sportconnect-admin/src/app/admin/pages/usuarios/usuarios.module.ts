import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosListComponent } from './usuarios-list/usuarios-list.component';

const routes: Routes = [
  {
    path: '',
    component: UsuariosListComponent,
  },
];

@NgModule({
  declarations: [
    UsuariosListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class UsuariosModule { }
