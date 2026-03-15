import { Component } from '@angular/core';

@Component({
  selector: 'ngx-app-politicas-pago',
  templateUrl: './politicas-pago.component.html',
  styleUrls: ['./politicas-pago.component.scss']
})
export class PoliticasPagoComponent {
  today: Date = new Date();

  constructor() { }

}
