import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { 
  NbCardModule, NbIconModule, NbButtonModule, NbBadgeModule,
  NbUserModule, NbInputModule, NbTooltipModule
} from '@nebular/theme';

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
    FormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbBadgeModule,
    NbUserModule,
    NbInputModule,
    NbTooltipModule,
  ],
})
export class UsuariosModule { }
