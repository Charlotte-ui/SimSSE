import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Scenario } from '../core/models/scenario';
import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';

@Injectable({
  providedIn: 'root',
})
export class ScenarioResolver implements Resolve<Scenario> {
  constructor(
    public scenarioService: ScenarioService,
  ) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<Scenario> {
    const scenarioId = route.paramMap.get('id');
    return new Promise<Scenario | undefined>((resolve, reject) => {
      this.scenarioService
        .getScenarioById(scenarioId)
        .subscribe((scenario: Scenario) => {
          scenario!.id = scenarioId;
          console.log('scenario');
          console.log(scenario);
          resolve(scenario as Scenario);
        });
    });
  }
}
