import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbLayoutModule } from '@nebular/theme';
import { CoachJoinComponent } from './coach-join.component';
import { CoachJoinRoutingModule } from './coach-join-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CoachJoinComponent],
  imports: [CommonModule, FormsModule, NbLayoutModule, CoachJoinRoutingModule, SharedModule]
})
export class CoachJoinModule {}
