import { Injectable } from '@angular/core';
import {
  VariablePhysioTemplate,
} from '../models/vertex/variablePhysio';
import { Observable, map, of } from 'rxjs';
import {
  Event,
} from '../models/vertex/node';
import { ApiService } from './api.service';
import { Vertex } from '../models/vertex/vertex';
import { Action, BioEvent, Categorie } from '../models/vertex/event';

@Injectable({
  providedIn: 'root',
})
export class RegleService {


  constructor(private apiService:ApiService) {}

  getVariableTemplate(): Observable<VariablePhysioTemplate[]> {
    return this.apiService.getClasseElements<VariablePhysioTemplate>(VariablePhysioTemplate);

  }

  getBioEvents(): Observable<BioEvent[]> {
    return this.apiService.getClasseElements(BioEvent)

  }

  getActions(): Observable<Action[]> {
    return this.apiService.getClasseElements(Action)
  }

  getCategories() {
     return this.apiService.getClasseElements(Categorie)
  }


  createRegle(regle: Vertex,classe:string):Observable<any> {
    regle['@class'] = classe;
    delete regle.id;
    return this.apiService.createDocument(regle)
    .pipe(map((response) => this.apiService.documentId(response)))
;
  }

  updateRegle(regle: Vertex):Observable<any> {
    return this.apiService.updateAllDocumentChamp(regle)

  }

  deleteRegle(id):Observable<any> {
    return this.apiService.deleteDocument(id)
  }



  createEvent(event: Event) {}

  createAction(event: any) {
    throw new Error('Method not implemented.');
  }

}
