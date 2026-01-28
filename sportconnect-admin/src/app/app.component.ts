import { Component } from '@angular/core';
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
      children: [
        { title: 'Todos los Usuarios', link: '/admin/usuarios' },
        { title: 'Clientes Activos', link: '/admin/usuarios/clientes' },
        { title: 'Usuarios Baneados', link: '/admin/usuarios/baneados' }
      ]
    },
    {
      title: 'Entrenadores',
      icon: 'award-outline',
      children: [
        { title: 'Solicitudes Pendientes', link: '/admin/entrenadores/solicitudes', badge: { text: '5', status: 'warning' } },
        { title: 'Entrenadores Activos', link: '/admin/entrenadores/activos' },
        { title: 'Entrenadores Rechazados', link: '/admin/entrenadores/rechazados' }
      ]
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
      children: [
        { title: 'Transacciones', link: '/admin/pagos/transacciones' },
        { title: 'Comisiones', link: '/admin/pagos/comisiones' },
        { title: 'Reembolsos', link: '/admin/pagos/reembolsos' }
      ]
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
      children: [
        { title: 'Estadísticas', link: '/admin/reportes/estadisticas' },
        { title: 'Denuncias', link: '/admin/reportes/denuncias', badge: { text: '2', status: 'danger' } },
        { title: 'Logs del Sistema', link: '/admin/reportes/logs' }
      ]
    }
  ];

  // Menú de usuario (header)
  userMenu: NbMenuItem[] = [
    { title: 'Perfil', icon: 'person-outline' },
    { title: 'Configuración', icon: 'settings-outline' },
    { title: 'Cerrar Sesión', icon: 'log-out-outline' }
  ];

  constructor(private sidebarService: NbSidebarService) {}

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }
}
