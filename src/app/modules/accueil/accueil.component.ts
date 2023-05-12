import { Component, OnInit } from '@angular/core';
import { Scenario } from '../../models/vertex/scenario';
import { ScenarioService } from '../../services/scenario.service';
import { Router } from '@angular/router';
import { Modele } from '../../models/vertex/modele';
import { ModeleService } from '../../services/modele.service';
import { RegleService } from '../../services/regle.service';
import { TagService } from '../../services/tag.service';
import { Tag } from '../../models/vertex/tag';
import { MatDialog } from '@angular/material/dialog';
import { WaitComponent } from '../shared/wait/wait.component';


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
    public tagService:TagService,
    public dialog: MatDialog
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
    this.dialog.open(WaitComponent);
    this.scenarioService.createScenario(scenario).subscribe(id =>{
      this.router.navigate(['/scenario/' + id]);
      this.dialog.closeAll();
    })
  }

  createModele(modele: Modele) {

    this.dialog.open(WaitComponent);

    this.modeleService.createModele(modele, true).subscribe(id =>{
      this.router.navigate(['/modele/' + id]);
      this.dialog.closeAll();
    })
    
  }
}
