import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.api';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { Vertex } from '../models/vertex/vertex';
import { AuthGuard } from '../helpers/auth.guard';

class User extends Vertex {
  login: string;
  token: string;
  admin:boolean;
  editor:boolean;
  animator:boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private http: HttpClient, private authguard:AuthGuard) {}
  login(login: string, mdp: string): Observable<any> {
    //http://localhost:2480/connect/simsse
    let token = btoa(login + ':' + mdp);
    return this.http
      .get<any>(`${environment.urlAPI}/connect/simsse`, {
        headers: { Authorization: 'Basic ' + token },
        //   params: { userId: userId },
      })
      .pipe(
        switchMap((response: any) => {
          localStorage.setItem('currentUser', token);
          localStorage.setItem('pseudo', login);

          return this.getUserInfo(login)


        })
      );
  }

  getUserInfo(login: string): Observable<User> {
    return this.http
      .get<any>(
        `${environment.urlAPI}/query/simsse/sql/select from User where login='${login}'`
      )
      .pipe(
        map((response) => {
          let user:User = response.result[0];
          console.log('response ', response);
          localStorage.setItem('admin', String(user.admin));
          localStorage.setItem('editor', String(user.editor));
          localStorage.setItem('animator', String(user.animator));
          return response;
        })
      );
  }


  alreadyLogin():boolean{
    return this.authguard.canActivate()
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.clear();
    location.reload();
  }
}
