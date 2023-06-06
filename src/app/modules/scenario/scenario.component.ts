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
import { Observable, concat, forkJoin, map, switchMap, zipAll } from 'rxjs';
import { Tag } from '../../models/vertex/tag';
import { WaitComponent } from '../shared/wait/wait.component';
import { Image } from 'src/app/services/image.service';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
})
export class ScenarioComponent implements OnInit {
  scenario!: Scenario;
  groupes!: Groupe[];
  plastrons!: Plastron[];
  totalPlastron!: number; // wrap in an array so the reference update trigger the Input() event
  plastronLoad = false; // have the plastrons been load in lot-plastrons component
  changesToSave = false;
  groupesToSave = false;
  map:Image;
  scenarioToSave!: boolean;
  oldTags!: Tag[]; // array of tags before changes, use to define wich tag create add wich delete after changes
  oldScenario!: Scenario; // scenario before changes, use to define wich champ update after changes
  oldGroupes!: Groupe[]; // scenario before changes, use to define wich champ update after changes

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
          this.oldScenario = { ...response['data'] };
          this.scenario.tags = [];

          this.scenarioService
            .initTags(this.scenario)
            .subscribe((tags: Tag[]) => {
              this.scenario.tags = tags;
              this.oldTags = [...tags];
            });

          return this.scenarioService.initGroupe(this.scenario).pipe(
            switchMap((groupes: Groupe[]) => {
              this.groupes = groupes;
              this.oldGroupes = structuredClone(groupes)
              const requestsGroupes = this.groupes.map((groupe: Groupe) => {
                return this.scenarioService.getGroupePlastrons(groupe.id).pipe(
                  map((plastrons: Plastron[]) => {
                    plastrons.map((plastron: Plastron) => {
                      plastron.groupe = groupe;
                    });
                    return plastrons;
                  })
                );
              });
              return concat(requestsGroupes).pipe(zipAll());
            })
          );
        })
      )
      .pipe(map((plastronss: Plastron[][]) => plastronss.flat(1)))
      .pipe(
        switchMap((plastrons: Plastron[]) => {
          const requests = plastrons.map((plastron: Plastron) => {
            return plastron.initModeleProfil(this.plastronService);
          });

          return concat(requests).pipe(zipAll());
        })
      )
      .subscribe((plastrons: Plastron[]) => {
        this.plastrons = plastrons;
      });
  }

  save() {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);

    if (this.scenarioToSave)
      requests.push(
        this.scenarioService.updateScenario(structuredClone(this.scenario), this.oldScenario)
      );

    // save the tags

    let newTags = this.scenario.tags.filter(
      (tag: Tag) => this.oldTags.indexOf(tag) < 0
    );

    let tagsToDelete = this.oldTags.filter(
      (tag: Tag) => !tag.id || this.scenario.tags.indexOf(tag) < 0
    );

    if (newTags.length > 0)
      requests.push(
        this.tagService.addTagsToSource(newTags, this.scenario.id, 'scenario')
      );

    if (tagsToDelete.length > 0)
      requests.push(
        this.tagService.deleteTagsFromSource(tagsToDelete, this.scenario.id)
      );

    if (this.groupesToSave) {
      requests.push(
        this.scenarioService.updateGroupes(this.groupes, this.oldGroupes)
      );
    }

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;
      this.dialog.closeAll();
      this.groupesToSave = false;
    });

    if (requests.length === 0) {
      this.changesToSave = false;
      this.dialog.closeAll();
      this.groupesToSave = false;
    }
  }

  reloadPlastron(event) {}

}
