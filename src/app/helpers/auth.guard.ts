import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {
    constructor(private router: Router) {}


    public  canActivate() {
        if (localStorage.getItem('currentUser') != null) {
            // authorised so return true
            return true;
        }
        // not logged in so redirect 
        this.router.navigateByUrl('connexion');
        return false;
    }
}