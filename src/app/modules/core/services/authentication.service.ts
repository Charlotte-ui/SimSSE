import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.api';

interface User {
  login: string;
  token:string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    public currentUser!: User;

    constructor(private http: HttpClient) {}

    login(login:string,mdp:string){
      //http://localhost:2480/connect/simsse 
      let token = btoa(login+":"+mdp);
      this.http
      .get<any>(`${environment.urlAPI}/connect/simsse`, {
          headers: { Authorization: 'Basic '+token },
       //   params: { userId: userId },
      })
      .subscribe((response: any) => {
          console.log("connexion") // TODO ; vérifier que erreur si mauvais mdp
          let user = {"login":login,"token":token};
          this.currentUser = user;
      });
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
    }
}