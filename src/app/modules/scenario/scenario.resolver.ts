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
export class ScenarioResolver implements Resolve<Scenario> {
 
  constructor(public firebaseService: FirebaseService,private router: Router) {}


  
  public resolve(route: ActivatedRouteSnapshot): Promise<Scenario> {
    const scenarioId = route.paramMap.get('id');
    return new Promise<Scenario| undefined>((resolve, reject) => {
       this.firebaseService
      .getElementInCollectionByIds<Scenario>("Scenario",scenarioId)
      .subscribe((scenario:Scenario) => {
        console.log("here")

        scenario!.id = scenarioId;
        console.log("scenario")

        console.log(scenario)
        resolve(scenario as Scenario);
      });

    }); 

    
  }
}
