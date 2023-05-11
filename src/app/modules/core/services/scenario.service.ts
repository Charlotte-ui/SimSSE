import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Scenario } from '../models/vertex/scenario';
import { Groupe } from '../models/vertex/groupe';
import { Plastron } from '../models/vertex/plastron';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  

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
 * push a new Scenario in the database
 * return the id of the new Scenario
 * @param scenario 
 */
createScenario(scenario: Scenario):Observable<string>{
  scenario["@class"] = "Scenario";
  delete scenario.id;
  delete scenario.tags;
  return this.apiService.createDocument(scenario)
  .pipe(map(response => this.apiService.documentId(response)));
}

/**
 * push a new Scenario in the database
 * return the id of the new Scenario
 * @param scenario 
 */
createGroupe(groupe: Groupe):Observable<string>{
  groupe["@class"] = "Groupe";
  delete groupe.id;
  delete groupe.scenario;
  return this.apiService.createDocument(groupe)
  .pipe(map(response => this.apiService.documentId(response)));
}

/**
 * push a new Scenario in the database
 * return the id of the new Scenario
 * @param scenario 
 */
updateScenario(scenario: Scenario):Observable<string>{
    return of("34:2").pipe ( delay( 5000 ));
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
