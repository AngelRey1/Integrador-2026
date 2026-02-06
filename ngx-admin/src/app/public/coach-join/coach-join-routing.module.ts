import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoachJoinComponent } from './coach-join.component';

const routes: Routes = [
  {
    path: '',
    component: CoachJoinComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoachJoinRoutingModule {}
