import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-shared-header',
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss']
})
export class SharedHeaderComponent {
  isHidden = false;
  private lastScrollTop = 0;

  constructor(private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const current =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // Si el usuario baja (y ya pasó un poco el hero), ocultamos
    if (current > this.lastScrollTop + 5 && current > 120) {
      this.isHidden = true;
    }
    // Si el usuario sube, mostramos
    else if (current < this.lastScrollTop - 5) {
      this.isHidden = false;
    }

    this.lastScrollTop = current <= 0 ? 0 : current;
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
