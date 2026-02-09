import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthFirebaseService } from '../services/auth-firebase.service';

@Injectable({ providedIn: 'root' })
export class EntrenadorGuard implements CanActivate {
  constructor(private authFirebase: AuthFirebaseService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authFirebase.getRole();
    if (role === 'ENTRENADOR' || role === 'entrenador') {
      return true;
    }
    // Redirigir al login si no es entrenador
    this.router.navigate(['/auth/login']);
    return false;
  }
}

