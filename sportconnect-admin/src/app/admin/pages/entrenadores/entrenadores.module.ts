import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { 
  NbCardModule, NbIconModule, NbButtonModule, NbBadgeModule,
  NbUserModule, NbTooltipModule, NbDialogModule, NbInputModule
} from '@nebular/theme';

import { EntrenadoresListComponent } from './entrenadores-list/entrenadores-list.component';
import { DocumentosDialogComponent } from './documentos-dialog/documentos-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: EntrenadoresListComponent,
  },
];

@NgModule({
  declarations: [
    EntrenadoresListComponent,
    DocumentosDialogComponent,
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
    NbTooltipModule,
    NbDialogModule.forChild(),
    NbInputModule,
  ],
})
export class EntrenadoresModule { }
