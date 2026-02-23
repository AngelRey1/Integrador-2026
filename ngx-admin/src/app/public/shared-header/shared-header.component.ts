import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-shared-header',
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss']
})
export class SharedHeaderComponent implements OnInit, OnDestroy {
  isHidden = false;
  private lastScrollTop = 0;
  menuOpen = false;
  isLoggedIn = false;
  userName = '';
  userRole = '';
  private authSubscription: Subscription;

  deportes = [
    'Todos',
    'Fútbol',
    'CrossFit',
    'Yoga',
    'Natación',
    'Running',
    'Boxeo',
    'Ciclismo',
    'Tenis',
    'Pilates',
    'Basketball',
    'Artes Marciales'
  ];

  constructor(
    private router: Router,
    private authFirebase: AuthFirebaseService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    console.log('=== SharedHeader ngOnInit ===');
    console.log('isLoggedIn inicial:', this.isLoggedIn);
    
    // Detectar estado de autenticación
    this.authSubscription = this.afAuth.authState.subscribe(async (user) => {
      console.log('=== authState cambió ===', user ? 'Usuario logueado' : 'Sin usuario');
      if (user) {
        this.isLoggedIn = true;
        const userData = this.authFirebase.getCurrentUserValue();
        if (userData) {
          this.userName = `${userData.nombre} ${userData.apellido}`;
          this.userRole = userData.rol;
        }
      } else {
        this.isLoggedIn = false;
        this.userName = '';
        this.userRole = '';
      }
      console.log('isLoggedIn después:', this.isLoggedIn);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

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
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  filtrarPorDeporte(deporte: string) {
    const deporteParam = deporte.toLowerCase();
    this.router.navigate(['/entrenadores'], {
      queryParams: { deporte: deporteParam === 'todos' ? null : deporteParam }
    });
    this.menuOpen = false;
  }

  irALogin(rol: 'CLIENTE' | 'ENTRENADOR') {
    console.log('=== irALogin llamado ===', rol);
    this.router.navigate(['/auth/login'], {
      queryParams: { rol }
    });
    this.menuOpen = false;
  }

  irARegistro() {
    this.router.navigate(['/auth/register']);
    this.menuOpen = false;
  }

  irAPanelCliente() {
    this.router.navigate(['/pages/cliente/dashboard']);
    this.menuOpen = false;
  }

  irAPanelEntrenador() {
    this.router.navigate(['/pages/entrenador/dashboard']);
    this.menuOpen = false;
  }

  async cerrarSesion() {
    await this.authFirebase.logout();
    this.router.navigate(['/']);
    this.menuOpen = false;
  }
}
