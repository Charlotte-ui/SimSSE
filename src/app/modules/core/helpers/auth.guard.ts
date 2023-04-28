import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterLink, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, take, tap ,mergeMap} from 'rxjs';
import "firebase/compat/auth";
import { AuthenticationService } from '../services/authentication.service';


@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {
    constructor(private router: Router,private authenticationService:AuthenticationService) {}



      canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
 
          if ( this.authenticationService.currentUser) return true;
         else {
            console.log("no user connected")
            this.router.navigateByUrl('connexion');
            return false;
          }
  
      }
}