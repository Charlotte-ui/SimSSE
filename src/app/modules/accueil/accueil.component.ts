import { Component, OnInit } from '@angular/core';
import { Scenario } from '../core/models/scenario';
import { ScenarioService } from '../core/services/scenario.service';
import { Router } from '@angular/router';
import { Modele } from '../core/models/modele';
import { ModeleService } from '../core/services/modele.service';
import { RegleService } from '../core/services/regle.service';
import { TagService } from '../core/services/tag.service';


@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.less'],
})
export class AccueilComponent implements OnInit {
  allTagsScenario!: string[];
  allTagsPlastron!: string[];

  Scenario = Scenario;
  Modele = Modele;

  constructor(
    private router: Router,
    public scenarioService: ScenarioService,
    public modeleService: ModeleService,
    public regleService: RegleService,
    public tagService:TagService
  ) {}

  ngOnInit(): void {
    this.tagService.getAllTags("scenario").subscribe((response) => {
      console.log("allTagsScenario")
      console.log(response)
      this.allTagsScenario = response;
    });
    this.tagService.getAllTags("plastron").subscribe((response) => {
      this.allTagsPlastron = response;
    });
  }

  createScenario(scenario: Scenario) {
    let newScenario = this.scenarioService.createScenario(scenario);
    this.router.navigate(['/scenario/' + newScenario.id]);
  }

  createModele(modele: Modele) {
    let newModele = this.modeleService.createNewModel(modele, true);
    this.router.navigate(['/modele/' + newModele.id]);
  }
}
