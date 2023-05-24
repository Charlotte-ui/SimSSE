import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.api';
import { Observable, concatMap, from, map, of } from 'rxjs';
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

  // return of("34:2").pipe ( delay( 5000 ));
  documentId(document: any): string {
    return document['@rid'].substring(1);
  }

  /**
   * GET
   */

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

  /**
   * UPDATE
   */

  updateDocumentChamp(id:string,champ:string,value:string){
    if(typeof value === 'string') value =  value.split('#').join('%23');
    return this.http.post<any>(
      `${environment.urlAPI}/function/simsse/updateVertex/${id}/${champ}/"${value}"`,
      {}
    );
  }

  updateAllDocumentChamp(document:any){
    let requests: Observable<any>[] = [];
    Object.keys(document).forEach((key) => {
      requests.push(
        this.updateDocumentChamp(document.id, key,  document[key].toString())
      );
    });
    if (requests.length > 0)
      return from(requests).pipe(
        concatMap((request: Observable<any>) => request)
      );
    else return of([]);
  }

  /**
   * CREATE
   */

  createDocument(document: Vertex|any) {
    return this.http.post<any>(
      `${environment.urlAPI}/document/simsse/`,
      document
    );
  }


  createRelationBetween(idIn: string, idOut: string, relation: string) {
    return this.http.post<any>(
      `${environment.urlAPI}/function/simsse/createEdge/${idOut}/${idIn}/${relation}`,
      {}
    );
  }

    createRelationBetweenWithProperty(idIn: string, idOut: string, relation: string,champ:string,value:string) {
    return this.http.post<any>(
      `${environment.urlAPI}/function/simsse/createEdgeWithProprety/${idOut}/${idIn}/${relation}/${champ}/${value}`,
      {}
    );
  }

  /**
   * DELETE
   */


  deleteDocument(id: string) {
    return this.http.delete<any>(
      `${environment.urlAPI}/document/simsse/${id}`
    );
  }

  deleteRelationBetween(idIn: string, idOut: string) {
     return this.http.post<any>(
      `${environment.urlAPI}/function/simsse/deleteEdgeBetween/${idOut}/${idIn}`,
      {}
    );
  }

    deleteEdge(idEdge: string) {
     return this.http.post<any>(
      `${environment.urlAPI}/function/simsse/deleteEdge/${idEdge}`,
      {}
    );
  }

  deleteOutRelation(idOut: string, relation: string) {
    return this.http.post<any>(
    `${environment.urlAPI}/function/simsse/deleteOutEdgeRelation/${idOut}/${relation}`,
    {}
  );
}
}
