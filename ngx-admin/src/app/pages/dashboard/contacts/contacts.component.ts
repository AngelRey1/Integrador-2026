import { Component } from '@angular/core';

@Component({
  selector: 'ngx-contacts',
  styleUrls: ['./contacts.component.scss'],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent {

  contacts: any[] = [];
  recent: any[] = [];

  constructor() {}
}
