import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';
import { SharedFooterComponent } from '../shared-footer/shared-footer.component';

@NgModule({
  declarations: [
    SharedHeaderComponent,
    SharedFooterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    NbLayoutModule,
    NbIconModule,
  ],
  exports: [
    SharedHeaderComponent,
    SharedFooterComponent,
  ],
})
export class SharedModule { }
