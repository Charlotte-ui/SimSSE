import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Scenario } from '../models/scenario';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {

  constructor(public firebaseService:FirebaseService) { }

getScenarios(): Observable<Scenario[]> {
    return this.firebaseService.getCollectionById<Scenario>("scenario");
}

getScenarioById(id:string): Observable<Scenario|undefined> {
    return this.firebaseService.getElementInCollectionByIds<Scenario>("scenario",id);
}


}
