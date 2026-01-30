import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../@core/services/auth.service';
import { Router } from '@angular/router';

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

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              private authService: AuthService,
              private router: Router) {
  }

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
    
    // Generar una foto consistente basada en el nombre de usuario o email
    const seed = nombreUsuario || email || 'usuario';
    const fotoId = this.generarFotoIdHombre(seed);
    
    // Configurar el usuario con el nombre/email del token y foto estática
    // Usar UI Avatars como respaldo confiable que genera avatares basados en iniciales
    this.user = {
      name: displayName,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00d68f&color=fff&size=128&bold=true`
    };

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

  // Generar un ID de foto consistente de HOMBRE basado en el nombre de usuario o email
  // Usa solo IDs específicos que son fotos de hombres en pravatar.cc
  private generarFotoIdHombre(texto: string): number {
    // IDs conocidos de fotos de hombres en pravatar.cc (1-70, pero seleccionamos solo hombres)
    const idsHombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                       21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                       41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
                       61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
    
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    // Seleccionar un ID de la lista de hombres usando el hash
    const indice = Math.abs(hash % idsHombres.length);
    return idsHombres[indice];
  }

}
