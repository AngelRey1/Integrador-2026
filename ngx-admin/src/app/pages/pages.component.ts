import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { Subscription } from 'rxjs';

import { getMenuByRole } from './pages-menu';
import { AuthFirebaseService } from '../@core/services/auth-firebase.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit, OnDestroy {

  menu: NbMenuItem[] = [];
  private subscription: Subscription | null = null;

  constructor(private authFirebase: AuthFirebaseService) {}

  ngOnInit() {
    // Obtener el rol del usuario actual desde Firebase
    const userRole = this.authFirebase.getRole();
    
    // Cargar el menú según el rol del usuario autenticado
    this.menu = getMenuByRole(userRole);
    
    // Suscribirse a cambios en el usuario para actualizar el menú
    this.subscription = this.authFirebase.getCurrentUser().subscribe(user => {
      if (user && user.rol) {
        // Actualizar el menú si el rol cambia
        this.menu = getMenuByRole(user.rol);
      } else if (!user) {
        // Si no hay usuario, volver al menú por defecto
        this.menu = getMenuByRole(null);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
