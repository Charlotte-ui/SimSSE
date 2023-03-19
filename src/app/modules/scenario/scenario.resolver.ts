import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Scenario } from '../core/models/scenario';
import { FirebaseService } from '../core/services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ScenarioResolver implements Resolve<Scenario| undefined> {
 
  constructor(public firebaseService: FirebaseService) {}
  
  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Scenario> {
    return new Promise<Scenario| undefined>((resolve, reject) => {
      const scenarioId = route.paramMap.get('id');
      if (scenarioId) this.firebaseService
      .getElementInCollectionByIds<Scenario>("Scenario",scenarioId)
      .subscribe((scenario) => {
        scenario!.id = scenarioId;
        resolve(scenario);
      });

    });
  }
}
