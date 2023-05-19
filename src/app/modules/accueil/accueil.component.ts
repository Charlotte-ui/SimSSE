import { Component } from '@angular/core';
import { Scenario } from '../../models/vertex/scenario';
import { ScenarioService } from '../../services/scenario.service';
import { Modele } from '../../models/vertex/modele';
import { ModeleService } from '../../services/modele.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.less'],
})
export class AccueilComponent {

  Scenario = Scenario;
  Modele = Modele;

  constructor(
    public scenarioService: ScenarioService,
    public modeleService: ModeleService,
  ) {}

}
