import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Scenario } from 'src/app/models/vertex/scenario';
import { ScenarioService } from 'src/app/services/scenario.service';


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
          resolve(scenario as Scenario);
        });
    });
  }
}
