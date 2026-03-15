import { Component } from '@angular/core';

@Component({
  selector: 'ngx-app-privacidad',
  templateUrl: './privacidad.component.html',
  styleUrls: ['./privacidad.component.scss']
})
export class PrivacidadComponent {
  today: Date = new Date();

  constructor() { }

}
