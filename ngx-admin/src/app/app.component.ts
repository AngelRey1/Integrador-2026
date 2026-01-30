/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, AfterViewInit {
  
  ngOnInit() {
    // Ocultar el spinner global cuando la aplicación esté lista
    this.hideSpinner();
  }

  ngAfterViewInit() {
    // Asegurarse de que el spinner se oculte después de que la vista se inicialice
    setTimeout(() => this.hideSpinner(), 100);
  }

  private hideSpinner() {
    const spinner = document.getElementById('nb-global-spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  }
}
