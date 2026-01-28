import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { PublicHomeComponent } from '../home/home.component';
import { LandingRoutingModule } from './landing-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SportIconsModule } from '../../@theme/components/sport-icons/sport-icons.module';

@NgModule({
  declarations: [
    PublicHomeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbLayoutModule,
    NbIconModule,
    NbEvaIconsModule,
    LandingRoutingModule,
    SharedModule,
    SportIconsModule,
  ],
})
export class LandingModule {}
