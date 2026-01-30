import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'sc-admin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SportConnect Admin';

  // Menú del sidebar
  menuItems: NbMenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/admin/dashboard',
      home: true
    },
    {
      title: 'GESTIÓN DE USUARIOS',
      group: true
    },
    {
      title: 'Usuarios',
      icon: 'people-outline',
      link: '/admin/usuarios',
    },
    {
      title: 'Entrenadores',
      icon: 'award-outline',
      link: '/admin/entrenadores',
      badge: {
        text: '4',
        status: 'warning',
      }
    },
    {
      title: 'OPERACIONES',
      group: true
    },
    {
      title: 'Reservas',
      icon: 'calendar-outline',
      link: '/admin/reservas'
    },
    {
      title: 'Pagos',
      icon: 'credit-card-outline',
      link: '/admin/pagos'
    },
    {
      title: 'CONFIGURACIÓN',
      group: true
    },
    {
      title: 'Deportes',
      icon: 'activity-outline',
      link: '/admin/deportes'
    },
    {
      title: 'Reportes',
      icon: 'bar-chart-outline',
      link: '/admin/reportes',
      badge: {
        text: '2',
        status: 'danger',
      }
    }
  ];

  // Menú de usuario (header)
  userMenu: NbMenuItem[] = [
    { title: 'Perfil', icon: 'person-outline' },
    { title: 'Configuración', icon: 'settings-outline' },
    { title: 'Ir a SportConnect', icon: 'external-link-outline', url: 'http://localhost:4200' },
    { title: 'Cerrar Sesión', icon: 'log-out-outline' }
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private router: Router
  ) {}

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'http://localhost:4200/auth/login';
  }
}
