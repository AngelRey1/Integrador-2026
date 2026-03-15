import { Component } from '@angular/core';

@Component({
  selector: 'ngx-app-terminos',
  templateUrl: './terminos.component.html',
  styleUrls: ['./terminos.component.scss']
})
export class TerminosComponent {
  today: Date = new Date();

  constructor() { }

}
