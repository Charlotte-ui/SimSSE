import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  urlAPI = "" // environment.urlAPI


  getClasseElements<T>(classe:string) {

    this.http
        .get<any>(`${this.urlAPI}/${classe}`, {
            headers: { user: 'editeur',mdp:'simsse' },
         //   params: { userId: userId },
        })
        .subscribe((response: T[]) => {
            //
        });
  }

}
