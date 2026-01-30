import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expected = route.data['roles'] as Array<string>;
    const role = this.auth.getRole();
    if (!role || (expected && expected.indexOf(role) === -1)) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
