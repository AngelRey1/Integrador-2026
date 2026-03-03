import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return of(false);
        }

        // Verificar si está en colección admins
        return this.firestore.collection('admins').doc(user.uid).get().pipe(
          map(doc => {
            if (doc.exists) {
              return true;
            } else {
              console.warn('Usuario no es admin:', user.email);
              this.afAuth.signOut();
              this.router.navigate(['/auth/login']);
              return false;
            }
          })
        );
      })
    );
  }
}
