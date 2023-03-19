import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, take, tap ,mergeMap} from 'rxjs';
import "firebase/compat/auth";


@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {
    constructor(private router: Router,private afAuth: AngularFireAuth) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.afAuth.authState.pipe(take(1), map(authState => !!authState), tap(authenticated => {
          if (!authenticated) {
            this.router.navigate(['/']);
          }
        }));
      }
}