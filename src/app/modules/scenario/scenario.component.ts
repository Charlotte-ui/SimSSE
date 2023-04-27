import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { Plastron, Statut } from '../core/models/plastron';
import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';
import { take } from 'rxjs';
import { ModeleService } from '../core/services/modele.service';
import { Modele, Triage } from '../core/models/modele';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../core/confirm-delete-dialog/confirm-delete-dialog.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProfilService } from '../core/services/profil.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegleService } from '../core/services/regle.service';

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
    public regleService: RegleService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((response) => {
      this.scenario = response['data'];

      this.scenarioService
        .getScenarioGroupes(this.scenario.id)
        .subscribe((response) => {
          this.groupes = response;
          this.plastrons = [];
          this.groupes.forEach((groupe, index) => {
            this.initialisePlastron(groupe);
          });
        });
    });
  }

  private initialisePlastron(groupe: Groupe) {
    console.log('initialisePlastron');
    console.log(groupe);
    this.scenarioService
      .getGroupePlastrons(groupe.id)
      .pipe(take(1))
      .subscribe((response: Plastron[]) => {
        console.log(response);
        response.forEach((plastron: Plastron) => {
          plastron.groupe = groupe;
        });

        this.plastrons = this.plastrons.concat(response);
      });
  }

  save() {}
}
