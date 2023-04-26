import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plastron } from '../core/models/plastron';
import { ModeleService } from '../core/services/modele.service';
import { Model } from 'echarts';
import { Modele } from '../core/models/modele';
import { ProfilService } from '../core/services/profil.service';
import {
  VariablePhysio,
  VariablePhysioInstance,
} from '../core/models/variablePhysio';
import { Link, Event, Trend, Graph } from '../core/models/node';
import { RegleService } from '../core/services/regle.service';
import { Profil } from '../core/models/profil';
import { PlastronService } from '../core/services/plastron.service';
import { Scenario } from '../core/models/scenario';
import { AddRegleDialogComponent } from '../regles/tab-regles/add-regle-dialog/add-regle-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NodeDialogComponent } from './editeur/editeur-graphe-nodal/node-dialog/node-dialog.component';
import { ModeleDialogComponent } from '../modele/modele-dialog/modele-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-plastron',
  templateUrl: './plastron.component.html',
  styleUrls: ['./plastron.component.less'],
})
export class PlastronComponent implements OnInit {
  plastron!: Plastron;
  modele!: Modele;
  profil!: Profil;
  targetVariable!: VariablePhysioInstance[];
  scenario: Scenario;

  changesToSave:boolean=false;

  allTags = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  constructor(
    private route: ActivatedRoute,
    private modelService: ModeleService,
    private profilService: ProfilService,
    public regleService: RegleService,
    public plastronService: PlastronService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((response) => {
      this.plastron = response['data'];

      this.modelService
        .getModeleById(this.plastron.modele)
        .subscribe((response) => {
          this.modele = response;
          this.initGragh();
        });

      this.profilService
        .getProfilById(this.plastron.profil)
        .subscribe((response) => {
          this.profil = response;
          this.initTargetVariables();
        });

      this.plastronService.getScenario(this.plastron).subscribe((response) => {
        console.log('scenario');

        this.scenario = response;
        console.log(this.scenario);
      });
    });
  }

  initTargetVariables() {
    this.plastronService
      .getVariablesCibles(this.plastron)
      .subscribe((response) => {
        this.targetVariable = response;
      });
  }

  initGragh() {
    this.modele['triggeredEvents'] = [
      [0, 'start'],
      [50, 'oxygénothérapie'],
    ];
    this.modele['graph'] = this.modelService.getGraph(); // TODO remove when back is finish
    this.modele['tags'] = ['Lemon', 'Lime', 'Apple'];
  }

  changeModele(){
    this.changesToSave = true

  }

  changeGraph($event){
    if ($event){
      console.log("changesToSave")
this.changesToSave = true
    }
        

  }

  changeProfil(){
        this.changesToSave = true

  }

  saveAsNewModel(event: boolean) {
    if (event) {
      console.log('saveAsNewModel');
      console.log(this.modele);
      let newModel = structuredClone(this.modele);
      newModel.titre = '';
      delete newModel.id;
      delete newModel.gabarit;

      //   <span id="titre">{{modele.titre}}</span>.

      const dialogRef = this.dialog.open(ModeleDialogComponent, {
        data: [
          newModel,
          'Le plastron actuel dérive du modèle ' +
            this.modele.titre +
            ', créer un nouveau modèle à partir du plastron actuel changera aussi le modèle auquel le plastron actuel fait référence.',
          this.allTags,
          false,
        ],
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);

        if (result == undefined) return;

        let newModele = this.modelService.createNewModel(result, true);

        this.plastronService.changeModelRef(this.plastron, newModele);
      });
    }
  }

  savePlastron(event: boolean) {
    if (event) {
      console.log('savePlastron');
      console.log(this.plastron);
      this.plastronService.updatePlastron(this.plastron);
          this.changesToSave = false

      this._snackBar.open(
        'Modifications du plastron ' + this.modele.titre + ' enregistrées !',
        'Ok',
        {
          duration: 3000,
        }
      );
    }
  }
}
