import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TerminosComponent } from './terminos/terminos.component';
import { PoliticasPagoComponent } from './politicas-pago/politicas-pago.component';
import { PrivacidadComponent } from './privacidad/privacidad.component';

const routes: Routes = [
  {
    path: 'terminos',
    component: TerminosComponent
  },
  {
    path: 'politicas-pago',
    component: PoliticasPagoComponent
  },
  {
    path: 'privacidad',
    component: PrivacidadComponent
  }
];

@NgModule({
  declarations: [
    TerminosComponent,
    PoliticasPagoComponent,
    PrivacidadComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LegalModule { }
