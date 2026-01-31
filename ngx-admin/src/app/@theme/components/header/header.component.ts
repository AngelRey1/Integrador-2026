import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../@core/services/auth.service';
import { Router } from '@angular/router';
import { NotificacionesFirebaseService, Notificacion } from '../../../@core/services/notificaciones-firebase.service';
import { CloudinaryService } from '../../../@core/services/cloudinary.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  currentRole: string = 'cliente';

  // Notificaciones
  notificaciones: Notificacion[] = [];
  notificacionesNoLeidas: number = 0;
  mostrarNotificaciones: boolean = false;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [
    { title: 'Perfil', data: { action: 'profile' } },
    { title: 'Cerrar Sesión', data: { action: 'logout' } },
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserData,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesFirebaseService,
    private cloudinaryService: CloudinaryService
  ) { }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    this.currentRole = this.authService.getRole() || 'cliente';

    // Obtener nombre de usuario o email del token para mostrar en el header
    let nombreUsuario = '';
    let email = '';

    try {
      nombreUsuario = this.authService.getNombreUsuario() || '';
      email = this.authService.getEmail() || '';
    } catch (e) {
      console.warn('Error obteniendo datos de usuario:', e);
    }

    const displayName = nombreUsuario || email || 'Usuario';

    // Usar CloudinaryService para obtener avatar
    this.user = {
      name: displayName,
      picture: this.cloudinaryService.getDefaultAvatarUrl(displayName, 128)
    };

    // Cargar notificaciones en tiempo real
    this.cargarNotificaciones();

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

    // Escuchar clics en el menú de usuario
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-context-menu'),
        takeUntil(this.destroy$),
      )
      .subscribe((event: any) => {
        const action = event.item?.data?.action;

        if (action === 'logout') {
          this.logout();
        } else if (action === 'profile') {
          this.goToProfile();
        }
      });
  }

  cargarNotificaciones(): void {
    // Escuchar notificaciones en tiempo real
    this.notificacionesService.getMisNotificaciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notificaciones => {
        this.notificaciones = notificaciones;
      });

    // Contar no leídas
    this.notificacionesService.contarNoLeidas()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.notificacionesNoLeidas = count;
      });
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  cerrarNotificaciones(): void {
    this.mostrarNotificaciones = false;
  }

  async marcarComoLeida(notificacion: Notificacion): Promise<void> {
    if (notificacion.id && !notificacion.leida) {
      await this.notificacionesService.marcarComoLeida(notificacion.id);
    }
  }

  async marcarTodasComoLeidas(): Promise<void> {
    await this.notificacionesService.marcarTodasComoLeidas();
  }

  formatearFecha(fecha: Date): string {
    return this.notificacionesService.formatearFechaRelativa(fecha);
  }

  getIconoNotificacion(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'NUEVA_RESERVA': 'calendar-outline',
      'RESERVA_CONFIRMADA': 'checkmark-circle-outline',
      'RESERVA_CANCELADA': 'close-circle-outline',
      'NUEVA_RESENA': 'star-outline',
      'PAGO_RECIBIDO': 'credit-card-outline',
      'GENERAL': 'bell-outline'
    };
    return iconos[tipo] || 'bell-outline';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goToProfile() {
    const role = this.authService.getRole();
    if (role === 'entrenador') {
      this.router.navigate(['/pages/entrenador/perfil']);
    } else if (role === 'admin') {
      // Los admins acceden a sportconnect-admin (app separada)
      window.location.href = '/admin';
    } else {
      this.router.navigate(['/pages/cliente/perfil']);
    }
  }
}

