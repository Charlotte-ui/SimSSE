import { Component, OnInit } from '@angular/core';
import { Scenario } from '../core/models/vertex/scenario';
import { ScenarioService } from '../core/services/scenario.service';
import { Router } from '@angular/router';
import { Modele } from '../core/models/vertex/modele';
import { ModeleService } from '../core/services/modele.service';
import { RegleService } from '../core/services/regle.service';
import { TagService } from '../core/services/tag.service';
import { Tag } from '../core/models/vertex/tag';


@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.less'],
})
export class AccueilComponent implements OnInit {
  allTagsScenario!: Tag[];
  allTagsPlastron!: Tag[];

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
      this.allTagsScenario = response;
    });
    this.tagService.getAllTags("modele").subscribe((response) => {
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
