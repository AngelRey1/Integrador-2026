import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthFirebaseService } from '../services/auth-firebase.service';

@Injectable({ providedIn: 'root' })
export class ClienteGuard implements CanActivate {
  constructor(private authFirebase: AuthFirebaseService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authFirebase.getRole();
    if (role === 'CLIENTE' || role === 'cliente') {
      return true;
    }
    // Redirigir al login si no es cliente
    this.router.navigate(['/auth/login']);
    return false;
  }
}
