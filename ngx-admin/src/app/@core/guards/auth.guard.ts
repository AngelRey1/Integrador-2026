import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthFirebaseService } from '../services/auth-firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authFirebase: AuthFirebaseService, private router: Router) {}

  canActivate(): boolean {
    if (this.authFirebase.isAuthenticated()) return true;
    this.router.navigate(['/auth/login']);
    return false;
  }
}
