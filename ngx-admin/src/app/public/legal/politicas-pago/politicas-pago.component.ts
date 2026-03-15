import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-politicas-pago',
  templateUrl: './politicas-pago.component.html',
  styleUrls: ['./politicas-pago.component.scss']
})
export class PoliticasPagoComponent implements OnInit {
  today: Date = new Date();

  constructor() { }

  ngOnInit(): void {
  }

}
