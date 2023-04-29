import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Scenario } from '../models/scenario';
import { Groupe } from '../models/groupe';
import { Plastron } from '../models/plastron';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  createScenario(scenario: Scenario) :Scenario{
    throw new Error('Method not implemented.');
  }

  constructor(public firebaseService:FirebaseService, public apiService:ApiService) { }

getScenarios(): Observable<Scenario[]> {
    return this.firebaseService.getCollectionById<Scenario>("Scenario");
}

getScenarioById(id:string): Observable<Scenario|undefined> {
  return this.apiService.getDocument(id)
  .pipe(map(response => (new Scenario(response))))
   // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
}

getScenarioGroupes(id:string): Observable<any[]> {
  return this.apiService.getRelationFrom(id,"seComposeDe");
  //return this.firebaseService.getElementInCollectionByMatchingChamp<Groupe>("Groupe","scenario",id);
}

getGroupe(link): Observable<Groupe|undefined> {
  return this.apiService.getDocument(link['in'].substring(1))
  .pipe(map(response => (new Groupe(response))))
   // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
}

getGroupePlastrons(id:string): Observable<any[]> {
  return this.apiService.getRelationFrom(id,"seComposeDe");
  //return this.firebaseService.getElementInCollectionByMatchingChamp<Plastron>("Plastron","groupe",id);
}

setScenario(scenario:Scenario) {

}

}
