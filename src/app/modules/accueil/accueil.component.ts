import { Component, OnInit } from '@angular/core';
import { Scenario } from '../core/models/scenario';
import { ScenarioService } from '../core/services/scenario.service';
import { Router } from '@angular/router';
import { Modele } from '../core/models/modele';
import { ModeleService } from '../core/services/modele.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.less']
})
export class AccueilComponent implements OnInit {

  constructor(private router: Router,public scenarioService:ScenarioService,public modeleService:ModeleService) { }

  ngOnInit(): void {
  }

  createScenario(scenario:Scenario){
    let newScenario = this.scenarioService.createScenario(scenario);
    this.router.navigate(['/scenario/'+newScenario.id]);
  }

  createModele(modele:Modele){
    let newModele = this.modeleService.createNewModel(modele,true);
    this.router.navigate(['/modele/'+newModele.id]);
  }

}
