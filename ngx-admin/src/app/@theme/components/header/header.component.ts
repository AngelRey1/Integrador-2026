import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { AuthService } from '../../../@core/services/auth.service';
import { Router } from '@angular/router';
import { NotificacionesFirebaseService, Notificacion } from '../../../@core/services/notificaciones-firebase.service';
import { CloudinaryService } from '../../../@core/services/cloudinary.service';
import { EntrenadorFirebaseService } from '../../../@core/services/entrenador-firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  userRole: string = ''; // Rol del usuario para mostrar/ocultar botones

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
    private cloudinaryService: CloudinaryService,
    private entrenadorService: EntrenadorFirebaseService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    this.currentRole = this.authService.getRole() || 'cliente';
    this.userRole = this.authService.getRole() || '';

    // Cargar datos reales del usuario desde Firebase
    this.cargarDatosUsuario();

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

  /**
   * Cargar datos reales del usuario desde Firebase
   */
  cargarDatosUsuario(): void {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          // Si no hay usuario autenticado, usar datos del token
          const nombreUsuario = this.authService.getNombreUsuario() || '';
          const email = this.authService.getEmail() || '';
          const displayName = nombreUsuario || email || 'Usuario';
          this.user = {
            name: displayName,
            picture: this.cloudinaryService.getDefaultAvatarUrl(displayName, 128)
          };
          return of(null);
        }

        // Buscar datos del usuario en Firestore
        if (this.currentRole === 'entrenador') {
          return this.firestore.doc(`entrenadores/${user.uid}`).valueChanges();
        } else {
          return this.firestore.doc(`users/${user.uid}`).valueChanges();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe((userData: any) => {
      if (userData) {
        // Obtener nombre y foto real
        const nombre = userData.nombre || userData.nombreCompleto || userData.email || 'Usuario';
        const apellido = userData.apellidoPaterno || userData.apellido || '';
        const displayName = apellido ? `${nombre} ${apellido}` : nombre;
        
        // Usar foto real si existe
        const fotoUrl = userData.foto || userData.fotoUrl || '';
        
        this.user = {
          name: displayName,
          picture: fotoUrl || this.cloudinaryService.getDefaultAvatarUrl(displayName, 128)
        };
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

  volverASportconnecta() {
    // Navega a la landing page principal
    this.router.navigate(['/']);
  }
}

