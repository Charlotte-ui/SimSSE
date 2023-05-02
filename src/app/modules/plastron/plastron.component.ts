import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plastron } from '../core/models/plastron';
import { ModeleService } from '../core/services/modele.service';
import { Modele } from '../core/models/modele';
import { ProfilService } from '../core/services/profil.service';
import {
  VariablePhysioInstance, VariablePhysioTemplate,
} from '../core/models/variablePhysio';
import { RegleService } from '../core/services/regle.service';
import { Profil } from '../core/models/profil';
import { PlastronService } from '../core/services/plastron.service';
import { Scenario } from '../core/models/scenario';
import { MatDialog } from '@angular/material/dialog';
import { ModeleDialogComponent } from '../modele/modele-dialog/modele-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jsPDF } from 'jspdf';
import { ScenarioService } from '../core/services/scenario.service';
import { Groupe } from '../core/models/groupe';
import { TagService } from '../core/services/tag.service';

@Component({
  selector: 'app-plastron',
  templateUrl: './plastron.component.html',
  styleUrls: ['./plastron.component.less'],
})
export class PlastronComponent implements OnInit {
  plastron!: Plastron;
  scenario: Scenario;

  changesToSave: boolean = false;

  allTags!: string[];

  constructor(
    private route: ActivatedRoute,
    private modelService: ModeleService,
    public regleService: RegleService,
    public plastronService: PlastronService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private scenarioService: ScenarioService,
    private tagService:TagService,
    private profilService:ProfilService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((response) => {
      this.plastron = response['data'];

      this.plastron.initModelProfil(this.plastronService) 

      /**
       * init scenario
       */
      // TODO : replace the nested subscribe
      this.plastronService
        .getPlastronGroupe(this.plastron.id)
        .subscribe((groupe:Groupe) => {
          this.scenarioService
            .getGroupeScenario(groupe.id)
            .subscribe((scenario: Scenario) => { 
              this.scenario = scenario;
            });
        });
      
        /**
         * init tags
         */
      this.tagService.getAllTags("modele").subscribe((response) => {
        this.allTags = response;
      });
    });

    /**
     * init target variables
     */
    this.regleService.getVariableTemplate().subscribe((variablesTemplate:VariablePhysioTemplate[]) =>{
      console.log("var physio tempalte")
      console.log(variablesTemplate)
      variablesTemplate.forEach(varTemp => {
        this.profilService.getVariable(this.plastron.profil.id,varTemp.id).subscribe((variable:VariablePhysioInstance)=>{
          if(variable.id == "") this.plastron.modele.createVariableCible(varTemp); // si la variable cible n'existe pas, on la crée
          this.plastron.profil.targetVariable.push(variable)
          console.log(variable)
        })
        
      });

    })

    /**
     * init graph
     */


  }

  initGragh() {
    this.plastron.modele['triggeredEvents'] = [
      [0, 'start'],
      [50, 'oxygénothérapie'],
    ];
    this.plastron.modele['graph'] = this.modelService.getGraph(); // TODO remove when back is finish
    this.plastron.modele['tags'] = ['Lemon', 'Lime', 'Apple'];
  }

  changeModele() {
    this.changesToSave = true;
  }

  changeGraph($event) {
    if ($event) {
      this.changesToSave = true;
    }
  }

  changeProfil() {
    this.changesToSave = true;
  }

  saveAsNewModel(event: boolean) {
    if (event) {
      console.log('saveAsNewModel');
      console.log(this.plastron.modele);
      let newModel = structuredClone(this.plastron.modele);
      newModel.title = '';
      delete newModel.id;
      delete newModel.gabarit;
      const dialogRef = this.dialog.open(ModeleDialogComponent, {
        data: [
          newModel,
          'Le plastron actuel dérive du modèle ' +
            this.plastron.modele.title +
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
      this.changesToSave = false;

      this._snackBar.open(
        'Modifications du plastron ' +
          this.plastron.modele.title +
          ' enregistrées !',
        'Ok',
        {
          duration: 3000,
        }
      );
    }
  }

  exportAsPdf(event: boolean) {
    if (event) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      doc.text('Hello world!', 10, 10);
      doc.save('a4.pdf');
    }
  }
}
