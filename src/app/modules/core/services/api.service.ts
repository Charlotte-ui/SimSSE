import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.api';
import { Observable, map, of } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { Vertex } from '../models/vertex/vertex';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  token!: string;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) {}

  getClasseElements<T extends Vertex>(classe: typeof Vertex): Observable<T[]> {
    /*     this.token = this.authenticationService.currentUser?.token; 
    return this.http
    .get<any>(`${environment.urlAPI}/query/simsse/sql/select from ${classe.className}`, {
      headers: { Authorization: 'Basic '+ this.token },
    })
    .pipe(map(response => (classe.instanciateListe<T>(response.result)))) */
    return this.http
      .get<any>(
        `${environment.urlAPI}/query/simsse/sql/select from ${classe.className}`
      )
      .pipe(map((response) => classe.instanciateListe<T>(response.result)));
  }

  getRelationFrom(
    rid: string,
    relation: string,
    classe: string
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.urlAPI}/query/simsse/sql/SELECT EXPAND( OUT("'${relation}'") ) FROM ${classe} WHERE @rid='${rid}'`
    );
  }

  getRelationTo(
    rid: string,
    relation: string,
    classe: string
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.urlAPI}/query/simsse/sql/SELECT EXPAND( IN("'${relation}'") ) FROM ${classe} WHERE @rid='${rid}'`
    );
  }

  getDocument(rid: string): Observable<any> {
    return this.http.get<any>(`${environment.urlAPI}/document/simsse/${rid}`);
  }

  getClasseElementsWhithMatchingChamp<T extends Vertex>(
    classe: typeof Vertex,
    champ: string,
    value: string | boolean
  ): Observable<T[]> {
    return this.http
      .get<any>(
        `${environment.urlAPI}/query/simsse/sql/select from ${classe.className} where ${champ}='${value}'`
      )
      .pipe(map((response) => classe.instanciateListe<T>(response.result)));
  }

  getVariable(idModele, idVariableTemplate) {
    return this.http
      .get<any>(`${environment.urlAPI}/query/simsse/sql/select intersect($a, $b) 
	let $a = (SELECT EXPAND( IN('aTemplate') ) FROM VariablePhysioTemplate WHERE @rid='${idVariableTemplate}'), 
    	$b = (SELECT EXPAND( OUT('aVariableCible') ) FROM Profil WHERE @rid='${idModele}')`);
  }

  getLinkAndRelationFrom(rid: string, relation: string, classe: string) {
    return this.http
      .get<any>(`${environment.urlAPI}/query/simsse/sql/SELECT $a, $b 
let $a= (SELECT EXPAND( OUT('${relation}') ) FROM ${classe} WHERE @rid='${rid}'),
	$b= (SELECT from ${relation} WHERE out='${rid}')`);
  }

  getLinkAndRelationFromMultiple(
    arrayRid: string[],
    relation: string,
    classe: string
  ) {
    return this.http
      .get<any>(`${environment.urlAPI}/query/simsse/sql/SELECT $a, $b 
let $a= (SELECT EXPAND( OUT('${relation}') ) FROM ${classe} WHERE @rid in [${arrayRid}]),
	$b= (SELECT from ${relation} WHERE out in [${arrayRid}])`);
  }

  getLinkFromMultiple(arrayRid: string[], relation: string) {
    return this.http.get<any>(
      `${environment.urlAPI}/query/simsse/sql/SELECT from ${relation} WHERE out in [${arrayRid}]`
    );
  }

  updateProprertyOfVertex(id: string, champ: string, value: string) {
    return this.http
      .put<any>(
        `${environment.urlAPI}/command/simsse/sql/UPDATE ${id} SET ${champ}='${value}'`,
        {}
      )
      .subscribe(() => {
        console.log('updateProprertyOfVertex ' + id);
      });
  }

  updateDocument(id: string, document, classe: string) {
    let content = document;
    content['@class'] = classe;

    return this.http
      .patch<any>(`${environment.urlAPI}/document/simsse/${id}`, content)
      .subscribe(() => {
        console.log('updateDocument ' + id);
      });
  }

  createRelationBetween(idIn:string,idOut:string,relation:string){
      return of('bloup')

  }

 deleteRelationBetween(idIn:string,idOut:string,relation:string){
      return of('bloup')

  }
}
