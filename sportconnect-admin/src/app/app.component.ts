import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuItem, NbSidebarService, NbThemeService, NbMediaBreakpointsService, NbMenuService } from '@nebular/theme';
import { Subject, of } from 'rxjs';
import { map, takeUntil, filter, switchMap } from 'rxjs/operators';
import { AdminFirebaseService } from './core/services/admin-firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'sc-admin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  title = 'Sportconnecta Admin';
  userPictureOnly: boolean = false;
  
  // Admin user data
  adminUser: { name: string; picture: string } = {
    name: 'Admin',
    picture: ''
  };

  // Temas disponibles (igual que entrenador)
  themes = [
    { value: 'default', name: 'Light' },
    { value: 'dark', name: 'Dark' },
    { value: 'cosmic', name: 'Cosmic' },
    { value: 'corporate', name: 'Corporate' },
  ];
  currentTheme = 'default';

  // Menú del sidebar (sin badges hardcodeados)
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
    }
  ];

  // Menú de usuario (header)
  userMenu: NbMenuItem[] = [
    { title: 'Perfil', data: { action: 'profile' } },
    { title: 'Ir a Sportconnecta', url: 'http://localhost:4200' },
    { title: 'Cerrar Sesión', data: { action: 'logout' } }
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private router: Router,
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private menuService: NbMenuService,
    private adminService: AdminFirebaseService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.currentTheme;
    
    // Forzar sidebar expandido al inicio
    this.sidebarService.expand('menu-sidebar');
    
    // Cargar datos del admin desde localStorage
    this.loadAdminUser();

    // Responsive: solo mostrar foto en pantallas pequeñas
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    // Escuchar eventos del menú de usuario
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'admin-menu'),
        takeUntil(this.destroy$)
      )
      .subscribe(({ item }) => {
        if (item.data?.action === 'logout') {
          this.logout();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminUser(): void {
    // Cargar datos del admin desde Firebase
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          // Si no hay usuario autenticado, usar datos de localStorage
          const adminUserStr = localStorage.getItem('admin_user');
          if (adminUserStr) {
            const adminData = JSON.parse(adminUserStr);
            this.adminUser = {
              name: adminData.nombre || adminData.email || 'Admin',
              picture: adminData.fotoUrl || this.generateAvatar(adminData.nombre || 'Admin')
            };
          } else {
            this.adminUser = {
              name: 'Admin',
              picture: this.generateAvatar('Admin')
            };
          }
          return of(null);
        }
        
        // Buscar datos del admin en Firestore (colección users con tipo admin)
        return this.firestore.doc(`users/${user.uid}`).valueChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe((userData: any) => {
      if (userData) {
        const nombre = userData.nombre || userData.email || 'Admin';
        const apellido = userData.apellidoPaterno || userData.apellido || '';
        const displayName = apellido ? `${nombre} ${apellido}` : nombre;
        
        // Usar foto real si existe
        const fotoUrl = userData.fotoUrl || userData.foto || '';
        
        this.adminUser = {
          name: displayName,
          picture: fotoUrl || this.generateAvatar(displayName)
        };
        
        // Actualizar localStorage también
        localStorage.setItem('admin_user', JSON.stringify(userData));
      }
    });
  }

  generateAvatar(name: string): string {
    // Usar UI Avatars para generar avatar
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=00D09C&color=ffffff&size=128`;
  }

  changeTheme(themeName: string): void {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    // false = toggle entre expandido y colapsado (no compacto)
    this.sidebarService.toggle(false, 'menu-sidebar');
    return false;
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'http://localhost:4200/auth/login';
  }
}
