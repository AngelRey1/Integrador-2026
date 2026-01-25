import { Component, OnInit } from '@angular/core';
import { NbIconLibraries } from '@nebular/theme';

@Component({
  selector: 'ngx-shared-footer',
  templateUrl: './shared-footer.component.html',
  styleUrls: ['./shared-footer.component.scss']
})
export class SharedFooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  constructor(private iconLibraries: NbIconLibraries) {}

  ngOnInit() {
    // Registrar Font Awesome si no está registrado
    if (!this.iconLibraries.getPack('fa')) {
      this.iconLibraries.registerFontPack('fa', { packClass: 'fa', iconClassPrefix: 'fa' });
    }
  }
}
