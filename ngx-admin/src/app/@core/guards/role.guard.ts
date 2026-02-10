import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthFirebaseService } from '../services/auth-firebase.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authFirebase: AuthFirebaseService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expected = route.data['roles'] as Array<string>;
    const role = this.authFirebase.getRole();
    if (!role || (expected && expected.indexOf(role) === -1)) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
