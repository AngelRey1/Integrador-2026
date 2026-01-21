import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PublicHomeComponent } from './home/home.component';
import { EntrenadoresListComponent } from './entrenadores-list/entrenadores-list.component';
import { EntrenadorPerfilComponent } from './entrenador-perfil/entrenador-perfil.component';

const routes: Routes = [
  {
    path: '',
    component: PublicHomeComponent,
  },
  {
    path: 'entrenadores',
    component: EntrenadoresListComponent,
  },
  {
    path: 'entrenador/:id',
    component: EntrenadorPerfilComponent,
  },
];

@NgModule({
  declarations: [
    PublicHomeComponent,
    EntrenadoresListComponent,
    EntrenadorPerfilComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
})
export class PublicModule { }
