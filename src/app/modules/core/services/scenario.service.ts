import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Scenario } from '../models/scenario';
import { Groupe } from '../models/groupe';
import { Plastron } from '../models/plastron';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  createScenario(scenario: Scenario) :Scenario{
    throw new Error('Method not implemented.');
  }

  constructor(public firebaseService:FirebaseService) { }

getScenarios(): Observable<Scenario[]> {
    return this.firebaseService.getCollectionById<Scenario>("Scenario");
}

getScenarioById(id:string): Observable<Scenario|undefined> {
    return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
}

getScenarioGroupes(id:string): Observable<Groupe[]|undefined> {
  return this.firebaseService.getElementInCollectionByMatchingChamp<Groupe>("Groupe","scenario",id);
}

getGroupePlastrons(id:string): Observable<Plastron[]|undefined> {
  return this.firebaseService.getElementInCollectionByMatchingChamp<Plastron>("Plastron","groupe",id);
}

setScenario(scenario:Scenario) {

}

}
