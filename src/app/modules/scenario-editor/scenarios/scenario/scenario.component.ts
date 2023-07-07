import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

import { Observable, concat, forkJoin, map, of, switchMap, zipAll } from 'rxjs';

import { Image } from 'src/app/services/image.service';
import { number } from 'echarts';
import { MatDialog } from '@angular/material/dialog';
import { Groupe } from 'src/app/models/vertex/groupe';
import { Plastron } from 'src/app/models/vertex/plastron';
import { Scenario } from 'src/app/models/vertex/scenario';
import { Tag } from 'src/app/models/vertex/tag';
import { WaitComponent } from 'src/app/modules/shared/wait/wait.component';
import { ModeleService } from 'src/app/services/modele.service';
import { PlastronService } from 'src/app/services/plastron.service';
import { ProfilService } from 'src/app/services/profil.service';
import { RegleService } from 'src/app/services/regle.service';
import { ScenarioService } from 'src/app/services/scenario.service';
import { TagService } from 'src/app/services/tag.service';
import { getElementByChamp } from 'src/app/functions/tools';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
})
export class ScenarioComponent implements OnInit {
  scenario!: Scenario;
  groupes!: Groupe[];
  groupeRecapValues!: Groupe[];
  plastrons!: Plastron[];
  totalPlastron!: number; // wrap in an array so the reference update trigger the Input() event
  plastronLoad = false; // have the plastrons been load in lot-plastrons component
  changesToSave = false;
  groupesToSave = false;
  map: Image;
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
  ) { }

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap((response: Data) => {
          this.scenario = response['data'];
          this.oldScenario = { ...response['data'] };

          return this.scenarioService.getScenarioGroupes(this.scenario.id).pipe(
            switchMap((groupes: Groupe[]) => {
              this.groupes = groupes;
              this.groupeRecapValues = structuredClone(groupes)
              const requestsGroupes = this.groupes.map((groupe: Groupe) => {
                return this.scenarioService.getGroupePlastrons(groupe.id).pipe(
                  map((plastrons: Plastron[]) => {

                    // we make a clone of each group to count the number of plastrons really ^resent in the groupe
                    let groupeClone = getElementByChamp<Groupe>(this.groupeRecapValues,'id',groupe.id)
                    groupeClone.EU = 0;
                    groupeClone.UA = 0;
                    groupeClone.UR = 0;
                    
                    plastrons.map((plastron: Plastron) => {
                      plastron.groupe = groupeClone;
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
    let requests: Observable<any>[] = [of('save')];
    this.dialog.open(WaitComponent);
/* 
    if (this.scenarioToSave)
      requests.push(
        this.scenarioService.updateScenario(structuredClone(this.scenario), this.oldScenario)
      );
 */


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

  reloadPlastron(event) { }

}
