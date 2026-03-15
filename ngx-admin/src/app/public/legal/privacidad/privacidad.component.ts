import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacidad',
  templateUrl: './privacidad.component.html',
  styleUrls: ['./privacidad.component.scss']
})
export class PrivacidadComponent implements OnInit {
  today: Date = new Date();

  constructor() { }

  ngOnInit(): void {
  }

}
