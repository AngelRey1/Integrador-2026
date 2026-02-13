import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbInputModule, NbIconModule } from '@nebular/theme';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PendienteAprobacionComponent } from './pendiente-aprobacion/pendiente-aprobacion.component';
import { SolicitudRechazadaComponent } from './solicitud-rechazada/solicitud-rechazada.component';
import { CuentaAprobadaComponent } from './cuenta-aprobada/cuenta-aprobada.component';
import { ConfirmComponent } from './confirm/confirm.component';

@NgModule({
  declarations: [
    LandingPageComponent, 
    LoginComponent, 
    RegisterComponent,
    PendienteAprobacionComponent,
    SolicitudRechazadaComponent,
    CuentaAprobadaComponent,
    ConfirmComponent
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    RouterModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule
  ],
  exports: [
    LandingPageComponent, 
    LoginComponent, 
    RegisterComponent,
    PendienteAprobacionComponent,
    SolicitudRechazadaComponent,
    CuentaAprobadaComponent,
    ConfirmComponent
  ]
})
export class AuthModule {}
