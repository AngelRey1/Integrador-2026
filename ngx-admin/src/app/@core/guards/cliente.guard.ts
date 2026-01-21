import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ClienteGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.auth.getRole();
    if (role === 'CLIENTE' || role === 'cliente') {
      return true;
    }
    // Redirigir al login si no es cliente
    this.router.navigate(['/auth/login']);
    return false;
  }
}
