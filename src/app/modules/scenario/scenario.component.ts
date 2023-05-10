import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Groupe } from '../core/models/vertex/groupe';
import { Scenario } from '../core/models/vertex/scenario';
import { Plastron } from '../core/models/vertex/plastron';
import { ScenarioService } from '../core/services/scenario.service';
import { ModeleService } from '../core/services/modele.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfilService } from '../core/services/profil.service';
import { RegleService } from '../core/services/regle.service';
import { TagService } from '../core/services/tag.service';
import { PlastronService } from '../core/services/plastron.service';
import { Modele } from '../core/models/vertex/modele';
import { Profil } from '../core/models/vertex/profil';
import { Observable, concat, forkJoin, switchMap, zipAll } from 'rxjs';
import { Tag } from '../core/models/vertex/tag';
import { WaitComponent } from '../shared/wait/wait.component';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
})
export class ScenarioComponent implements OnInit {
  scenario!: Scenario;
  groupes!: Groupe[];
  plastrons!: Plastron[];
  totalPlastron!: number;
  plastronLoad = false; // have the plastrons been load in lot-plastrons component
  changesToSave = false;

  newScenario!: Scenario;
  newTags!: Tag[];

  constructor(
    private route: ActivatedRoute,
    public scenarioService: ScenarioService,
    public modelService: ModeleService,
    public profilService: ProfilService,
    public dialog: MatDialog,
    public regleService: RegleService,
    public tagService: TagService,
    public plastronService: PlastronService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap((response: Data) => {
          this.scenario = response['data'];
          this.scenario.tags = [];

          const requestTag = this.tagService.getTags(
            this.scenario.id,
            'Scenario'
          );

          const requestGroupe = this.scenarioService.getScenarioGroupes(
            this.scenario.id
          );

          return forkJoin([requestTag, requestGroupe]);
        })
      )
      .subscribe((response: [Tag[], Groupe[]]) => {
        this.groupes = response[1];
        this.plastrons = [];
        this.initialisePlastron();
        this.scenario.tags = response[0];
      });
  }

  private initialisePlastron() {
    this.groupes.forEach((groupe) => {
      let groupePlastron: Plastron[] = [];

      this.scenarioService
        .getGroupePlastrons(groupe.id)
        .pipe(
          switchMap((plastrons: Plastron[]) => {
            groupePlastron = plastrons;

            const requests = plastrons.map((plastron: Plastron) => {
              plastron.groupe = groupe;
              return plastron.initModeleProfil(this.plastronService);
            });

            return concat(requests).pipe(zipAll());
          })
        )
        .subscribe((result: [Modele, Profil][]) => {
          groupePlastron.map((plastron: Plastron, index: number) => {
            plastron.modele = result[index][0];
            plastron.profil = result[index][1];
          });

          this.plastrons = [...this.plastrons.concat(groupePlastron)]; // forced update
        });
    });
  }

  updateScenario(newScenario: Scenario) {
    this.changesToSave = true;
    this.newScenario = newScenario;
  }

  updateTags(newTags: Tag[]) {
    this.changesToSave = true;
    this.newTags = newTags;
  }

  save() {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);
    if (this.newScenario)
      requests.push(this.scenarioService.updateScenario(this.newScenario));

    if (this.newTags){
            let tagToDelete = this.scenario.tags.filter(item => this.newTags.indexOf(item) < 0)
// TODO : dabug tag filter
      this.newTags = this.newTags.filter(item => this.scenario.tags.indexOf(item) < 0)
      console.log("true new tags")
      console.log(this.newTags )
            console.log("tagToDelete")
      console.log(tagToDelete )
      if(this.newTags.length>0) requests.push(this.tagService.updateTags(this.newTags,this.scenario.id));

    }

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;
      this.dialog.closeAll();
    });
  }

  reloadPlastron(event) {}
}
