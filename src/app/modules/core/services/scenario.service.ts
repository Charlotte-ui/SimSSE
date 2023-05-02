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
  return this.apiService.getClasseElements<Scenario>(Scenario);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
}

getScenarioById(id:string): Observable<Scenario|undefined> {
  return this.apiService.getDocument(id)
  .pipe(map(response => (new Scenario(response))))
}

/**
 * renvoi les groupes liés à un scenario
 * @param id 
 * @returns 
 */
getScenarioGroupes(id:string): Observable<Groupe[]> {
  return this.apiService.getRelationFrom(id,"seComposeDe",'Scenario')
  .pipe(map(response => (Groupe.instanciateListe<Groupe>(response.result))))
}

getGroupeScenario(id:string): Observable<Scenario> {
  return this.apiService.getRelationTo(id,"seComposeDe","Groupe")
  .pipe(map(response => new Scenario(response.result[0])))
}

getGroupeByLink(link,direction): Observable<Groupe|undefined> {
  return this.apiService.getDocument(link[direction].substring(1))
  .pipe(map(response => (new Groupe(response))))
}

getScenarioByLink(link,direction): Observable<Scenario|undefined> {
  return this.getScenarioById(link[direction].substring(1)) 
}


getGroupePlastrons(id:string): Observable<Plastron[]> {
  return this.apiService.getRelationFrom(id,"seComposeDe",'Groupe')
  .pipe(map(response => (Plastron.instanciateListe<Plastron>(response.result))))
}

setScenario(scenario:Scenario) {

}

}
