import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.api';
import { Router } from '@angular/router';

interface User {
  login: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private http: HttpClient) {}
  login(login: string, mdp: string) : Observable<any>{
    //http://localhost:2480/connect/simsse
    let token = btoa(login + ':' + mdp);
    return this.http
      .get<any>(`${environment.urlAPI}/connect/simsse`, {
        headers: { Authorization: 'Basic ' + token },
        //   params: { userId: userId },
      })
      .pipe(
        map((response: any) => {
          localStorage.setItem('currentUser', token);
          localStorage.setItem('pseudo', login);
          localStorage.setItem('role', 'editeur');

          return response
        })
      )
  }

  getUserInfo(u_login: string): Observable<User[]> {
    return this.http.post<any>(`${environment.urlAPI}/users/getInfo`, {
      u_login,
    });
  }
  isAdmin(u_login: string) {
    return this.http.post<any>(`${environment.urlAPI}/users/isAdmin`, {
      u_login,
    });
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.clear();
    location.reload();
  }
}
