import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PendienteAprobacionComponent } from './pendiente-aprobacion/pendiente-aprobacion.component';
import { SolicitudRechazadaComponent } from './solicitud-rechazada/solicitud-rechazada.component';
import { CuentaAprobadaComponent } from './cuenta-aprobada/cuenta-aprobada.component';

@NgModule({
  declarations: [
    LandingPageComponent, 
    LoginComponent, 
    RegisterComponent,
    PendienteAprobacionComponent,
    SolicitudRechazadaComponent,
    CuentaAprobadaComponent
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    RouterModule
  ],
  exports: [
    LandingPageComponent, 
    LoginComponent, 
    RegisterComponent,
    PendienteAprobacionComponent,
    SolicitudRechazadaComponent,
    CuentaAprobadaComponent
  ]
})
export class AuthModule {}
