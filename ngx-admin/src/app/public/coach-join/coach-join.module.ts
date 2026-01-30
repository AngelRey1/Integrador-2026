import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { CoachJoinComponent } from './coach-join.component';
import { CoachJoinRoutingModule } from './coach-join-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CoachJoinComponent],
  imports: [CommonModule, FormsModule, NbLayoutModule, NbIconModule, NbEvaIconsModule, CoachJoinRoutingModule, SharedModule]
})
export class CoachJoinModule {}
