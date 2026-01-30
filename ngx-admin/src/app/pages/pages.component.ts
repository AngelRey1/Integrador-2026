import { Component, OnInit } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

import { getMenuByRole } from './pages-menu';
import { AuthService } from '../@core/services/auth.service';

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
export class PagesComponent implements OnInit {

  menu: NbMenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Obtener el rol del usuario actual desde el token JWT
    // El rol se establece automáticamente cuando el usuario hace login
    const userRole = this.authService.getRole();
    
    // Cargar el menú según el rol del usuario autenticado
    // No se puede cambiar manualmente, solo se obtiene del token
    this.menu = getMenuByRole(userRole);
    
    // Suscribirse a cambios en el usuario para actualizar el menú si cambia el token
    this.authService.currentUser().subscribe(user => {
      if (user && user.role) {
        // Actualizar el menú si el rol cambia (por ejemplo, después de un nuevo login)
        this.menu = getMenuByRole(user.role);
      } else if (!user) {
        // Si no hay usuario, volver al menú por defecto
        this.menu = getMenuByRole(null);
      }
    });
  }
}
