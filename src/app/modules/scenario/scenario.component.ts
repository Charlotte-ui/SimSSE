import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Groupe } from '../../models/vertex/groupe';
import { Scenario } from '../../models/vertex/scenario';
import { Plastron } from '../../models/vertex/plastron';
import { ScenarioService } from '../../services/scenario.service';
import { ModeleService } from '../../services/modele.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfilService } from '../../services/profil.service';
import { RegleService } from '../../services/regle.service';
import { TagService } from '../../services/tag.service';
import { PlastronService } from '../../services/plastron.service';
import { Modele } from '../../models/vertex/modele';
import { Profil } from '../../models/vertex/profil';
import { Observable, concat, forkJoin, switchMap, zipAll } from 'rxjs';
import { Tag } from '../../models/vertex/tag';
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
  groupesToSave = false;

  newScenario!: Scenario;
  oldTags!: Tag[]; // array of tags before changes, use to define wich tag create add wich delete after changes
  oldScenario!:Scenario; // scenario before changes, use to define wich champ update after changes
  oldGroupes!:Groupe[]; // scenario before changes, use to define wich champ update after changes

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
          this.oldScenario = {...response['data']}
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
        this.oldGroupes = structuredClone(response[1])
        this.plastrons = [];
        this.initialisePlastron();
        this.scenario.tags = response[0];

        console.log("tags scenraio")
        console.log(response[0])

        this.oldTags = [...response[0]];
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
  }

  updateGroupes(newGroupes: boolean) {
    console.log("updateGroupes")
    console.log(this.groupes)
    this.changesToSave = true;
    this.groupesToSave = true;
  }

  save() {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);

    console.log("oldscenario")
    console.log(this.oldScenario)

    console.log("newScenario")
    console.log(this.newScenario)

    if (this.newScenario)
      requests.push(this.scenarioService.updateScenario(this.newScenario,this.oldScenario));

    // save the tags

    let newTags = this.scenario.tags.filter(
      (tag: Tag) => this.oldTags.indexOf(tag) < 0
    );

    let tagsToDelete = this.oldTags.filter(
      (tag: Tag) => !tag.id || this.scenario.tags.indexOf(tag) < 0
    );

    if (newTags.length > 0)
      requests.push(this.tagService.addTagsToSource(newTags, this.scenario.id,'scenario'));

    if (tagsToDelete.length > 0)
      requests.push(this.tagService.deleteTagsFromSource(tagsToDelete, this.scenario.id));

    console.log("oldGroupes ",this.oldGroupes)
    console.log("groupes ",this.groupes)

    if(this.groupesToSave){
      requests.push(this.scenarioService.updateGroupes(this.groupes,this.oldGroupes));
    }

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;
      this.dialog.closeAll();
      this.groupesToSave = false;
    });
  }

  reloadPlastron(event) {}
}
