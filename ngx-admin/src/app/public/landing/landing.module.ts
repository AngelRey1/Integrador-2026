import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { PublicHomeComponent } from '../home/home.component';
import { LandingRoutingModule } from './landing-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    PublicHomeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbLayoutModule,
    NbIconModule,
    LandingRoutingModule,
    SharedModule,
  ],
})
export class LandingModule {}
