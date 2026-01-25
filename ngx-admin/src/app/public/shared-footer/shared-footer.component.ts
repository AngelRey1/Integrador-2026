import { Component } from '@angular/core';

@Component({
  selector: 'ngx-shared-footer',
  templateUrl: './shared-footer.component.html',
  styleUrls: ['./shared-footer.component.scss']
})
export class SharedFooterComponent {
  currentYear = new Date().getFullYear();
}
