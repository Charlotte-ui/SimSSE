import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.api';
import { Observable, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from './authentication.service';
import { Vertex } from '../models/vertex';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  token!:string

  constructor(private http: HttpClient, private authenticationService:AuthenticationService) { 
    this.token = this.authenticationService.currentUser?.token; // le token s'initialise toujours à undefined
  }

  getClasseElements<T extends Vertex>(classe: typeof Vertex):Observable<T[]>{
    this.token = this.authenticationService.currentUser?.token; 
    return this.http
        .get<any>(`${environment.urlAPI}/query/simsse/sql/select from ${classe.className}`, {
          headers: { Authorization: 'Basic '+ this.token },
        })
        .pipe(map(response => (classe.instanciateListe<T>(response.result))))
  }
}

