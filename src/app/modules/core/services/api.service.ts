import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.api';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }






  getClasseElements<T>(classe:string) {

    this.http
        .get<any>(`${environment.urlAPI}/${classe}`, {
            headers: { user: 'editeur',mdp:'simsse' },
         //   params: { userId: userId },
        })
        .subscribe((response: T[]) => {
            //
        });
  }

}
