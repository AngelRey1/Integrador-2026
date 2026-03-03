import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbToastrModule } from '@nebular/theme';
import { ChatListComponent } from './chat-list/chat-list.component';

const routes: Routes = [
  {
    path: '',
    component: ChatListComponent,
  },
];

@NgModule({
  declarations: [
    ChatListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbToastrModule,
    RouterModule.forChild(routes),
  ],
})
export class ChatModule { }
