import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { PagosListComponent } from './pagos-list/pagos-list.component';
import { ValidarSuscripcionesComponent } from './validar-suscripciones/validar-suscripciones.component';
import {
  NbCardModule, NbIconModule, NbButtonModule, NbBadgeModule, NbSpinnerModule, NbAlertModule
} from '@nebular/theme';

const routes: Routes = [
  { path: '', component: PagosListComponent },
  { path: 'suscripciones', component: ValidarSuscripcionesComponent },
];

@NgModule({
  declarations: [
    PagosListComponent,
    ValidarSuscripcionesComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbBadgeModule,
    NbSpinnerModule,
    NbAlertModule,
  ],
})
export class PagosModule { }
