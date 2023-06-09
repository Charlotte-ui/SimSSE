import { Component } from '@angular/core';
import { Modele } from 'src/app/models/vertex/modele';
import { Scenario } from 'src/app/models/vertex/scenario';
import { ModeleService } from 'src/app/services/modele.service';
import { ScenarioService } from 'src/app/services/scenario.service';

@Component({
  selector: 'app-scenarios',
  templateUrl: './scenarios.component.html',
  styleUrls: ['./scenarios.component.less']
})
export class ScenariosComponent {
  Scenario = Scenario;
  Modele = Modele;

  constructor(
    public scenarioService: ScenarioService,
    public modeleService: ModeleService,
  ) {}
}
