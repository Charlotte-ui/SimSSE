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

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
})
export class ScenarioComponent implements OnInit {
  scenario!: Scenario;
  groupes!: Groupe[];
  plastrons!: Plastron[];
  totalPlastron: number = 0;

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

      this.tagService.getTags(this.scenario.id).subscribe((response) => {
        response['result'].forEach((link) => {
          this.tagService.getTagName(link).subscribe((tag) => {
            this.scenario.tags.push(tag.value);
          });
        });
      });

      this.groupes = [];
      this.plastrons = [];

      this.scenarioService
        .getScenarioGroupes(this.scenario.id)
        .subscribe((response) => {
          response['result'].forEach((link) => {
            this.scenarioService.getGroupeByLink(link,'in').subscribe((group) => {
              this.groupes.push(group);
              this.initialisePlastron(group);
              this.groupes = [...this.groupes] // forced update
            });
          });
        });
    });
  }

  private initialisePlastron(groupe: Groupe) {
    let groupPlastron: Plastron[] = [];
    this.scenarioService.getGroupePlastrons(groupe.id).subscribe((response) => {
      response['result'].forEach((link, index: number) => {
        this.plastronService
          .getPlastronByLink(link)
          .subscribe((plastron: Plastron) => {
            groupPlastron.push(plastron);
            plastron.groupe = groupe;
            if (index == response['result'].length - 1)
              this.plastrons = this.plastrons.concat(groupPlastron);
          });
      });
    });
  }

  save() {}
}
