import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class EntrenadorGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.auth.getRole();
    if (role === 'ENTRENADOR' || role === 'entrenador') {
      return true;
    }
    // Redirigir al login si no es entrenador
    this.router.navigate(['/auth/login']);
    return false;
  }
}

