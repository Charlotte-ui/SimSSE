import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { Plastron } from '../core/models/plastron';
import { ScenarioService } from '../core/services/scenario.service';
import { ModeleService } from '../core/services/modele.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfilService } from '../core/services/profil.service';
import { RegleService } from '../core/services/regle.service';
import { TagService } from '../core/services/tag.service';
import { PlastronService } from '../core/services/plastron.service';
import { Modele } from '../core/models/modele';
import { Profil } from '../core/models/profil';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
})
export class ScenarioComponent implements OnInit {
  scenario!: Scenario;
  groupes!: Groupe[];
  plastrons!: Plastron[];
  totalPlastron!:number;
  plastronLoad = false; // have the plastrons been load in lot-plastrons component

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
    this.route.data.subscribe((response) => {
      this.scenario = response['data'];
      this.scenario.tags = [];
      this.tagService
        .getTags(this.scenario.id, 'Scenario')
        .subscribe((tags) => {
          tags.forEach((tag) => {
            this.scenario.tags.push(tag.value);
          });
        });
      this.groupes = [];
      this.plastrons = [];
      this.scenarioService
        .getScenarioGroupes(this.scenario.id)
        .subscribe((groupes: Groupe[]) => {
          this.groupes = groupes;
          this.initialisePlastron(groupes);
          // this.groupes = [...this.groupes] // forced update
        });
    });
  }

  // TODO : replace nested subscribe
  private initialisePlastron(groupes: Groupe[]) {
    groupes.forEach((groupe) => {
      this.scenarioService
        .getGroupePlastrons(groupe.id)
        .subscribe((plastrons: Plastron[]) => {
          plastrons.map((plastron: Plastron,index:number) => {
            plastron.groupe = groupe;

            this.plastronService
              .getPlastronModele(plastron.id)
              .subscribe((modele: Modele) => {
                plastron.modele = modele;

                if(plastrons.length-1 == index) {
                  this.plastrons = [...this.plastrons]; // forced update
                }
              });

            this.plastronService
              .getPlastronProfil(plastron.id)
              .subscribe((profil: Profil) => {
                plastron.profil = profil;
              });
          });
          console.log('plsatrons');
          console.log(plastrons);

          this.plastrons = [...this.plastrons.concat(plastrons)]; // forced update
        });
    });
  }

  save() {}

  reloadPlastron(event) {
   
  }
}
