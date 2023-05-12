import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Plastron } from '../../models/vertex/plastron';
import { ModeleService } from '../../services/modele.service';
import { Modele } from '../../models/vertex/modele';
import { Graph, Node, Event, Link } from '../../models/vertex/node';

import { ProfilService } from '../../services/profil.service';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../models/vertex/variablePhysio';
import { RegleService } from '../../services/regle.service';
import { Profil } from '../../models/vertex/profil';
import { PlastronService } from '../../services/plastron.service';
import { Scenario } from '../../models/vertex/scenario';
import { MatDialog } from '@angular/material/dialog';
import { ModeleDialogComponent } from '../modele/modele-dialog/modele-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScenarioService } from '../../services/scenario.service';
import { Groupe } from '../../models/vertex/groupe';
import { TagService } from '../../services/tag.service';
import { Trigger } from '../../models/trigger';
import { Observable, concat, forkJoin, switchMap, zipAll } from 'rxjs';
import { Tag } from '../../models/vertex/tag';
import { Pdf } from '../../models/pdf';
import { Curve } from '../../models/curve';
import { WaitComponent } from '../shared/wait/wait.component';

@Component({
  selector: 'app-plastron',
  templateUrl: './plastron.component.html',
  styleUrls: ['./plastron.component.less'],
})
export class PlastronComponent implements OnInit {
  plastron!: Plastron;
  scenario: Scenario;
  
  variablesTemplate: VariablePhysioTemplate[] = [];

  allTags!: Tag[];

  curves!: Curve[];


  /**
   * save the changes
   */


  changesToSave: boolean = false;
  newTags:Tag[];
  tagsToDelete:Tag[];


  constructor(
    private route: ActivatedRoute,
    private modelService: ModeleService,
    public regleService: RegleService,
    public plastronService: PlastronService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private scenarioService: ScenarioService,
    private tagService: TagService,
    private profilService: ProfilService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap((response: Data) => {
          this.plastron = response['data'];

          const requestModelProfil = this.plastron.initModeleProfil(
            this.plastronService
          );

          const requestScenario = this.plastronService
            .getPlastronGroupe(this.plastron.id)
            .pipe(
              switchMap((groupe: Groupe) => {
                const request = this.scenarioService.getGroupeScenario(
                  groupe.id
                );
                return concat(request);
              })
            );

          return forkJoin([requestModelProfil, requestScenario]);
        })
      )
      .subscribe((response: [[Modele, Profil], Scenario]) => {
        this.plastron.modele = response[0][0];
        this.plastron.profil = response[0][1];
        this.scenario = response[1];
        this.initTrigger();
        this.initVariables();
      });

    /**
     * init tags
     */
    this.tagService.getAllTags('modele').subscribe((response: Tag[]) => {
      this.allTags = response;
    });
  }

  initTrigger() {
    this.modelService
      .getTrigger(this.plastron.modele.id)
      .subscribe((result: any) => {
        this.plastron.modele.triggeredEvents = result.$a.map(
          (event: Event, index: number) =>
            new Trigger({
              time: result.$b[index].time,
              id: event.event,
            })
        );
      });
  }

  /**
   * init target variables
   */
  initVariables() {
    this.regleService
      .getVariableTemplate()
      .pipe(
        switchMap((variablesTemplates: VariablePhysioTemplate[]) => {
          this.variablesTemplate = variablesTemplates;

          const requests = variablesTemplates.map(
            (varTemp: VariablePhysioTemplate) =>
              this.profilService.getVariable(
                this.plastron.profil.id,
                varTemp.id
              )
          );
          return concat(requests).pipe(zipAll());
        })
      )
      .subscribe((variables: VariablePhysioInstance[]) => {
        this.plastron.profil.targetVariable = variables;

        variables.forEach((variable: VariablePhysioInstance, index: number) => {
          if (variable.id == '')
            this.plastron.modele.createVariableCible(
              this.variablesTemplate[index]
            );
          // si la variable cible n'existe pas, on la crée
          else {
            variable.name = this.variablesTemplate[index].name;
            variable.color = this.variablesTemplate[index].color;
            variable.template = this.variablesTemplate[index].id;
          }
        });
      });
  }

  changeModele() {
    this.changesToSave = true;
  }

  changeGraph($event) {
    if ($event) {
      this.changesToSave = true;
    }
  }

  changeCurves(event) {
    if (event) {
      this.curves = event;
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
      delete newModel.template;
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

        
        this.modelService.createModele(result, true).subscribe((id:string) =>{
          this.plastronService.changeModelRef(this.plastron, id);
        })

        
      });
    }
  }

  save(event: boolean) {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);

    // save the tags
    if (this.newTags.length > 0)
      requests.push(this.tagService.addTagsToSource(this.newTags, this.plastron.modele.id,'modele'));

    if (this.tagsToDelete.length > 0)
      requests.push(this.tagService.deleteTagsFromSource(this.tagsToDelete, this.plastron.modele.id));

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;
      this.dialog.closeAll();
    });


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
      new Pdf(this.plastron.modele, this.curves);
      /* 
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      doc.text('EXERCICE ORSEC', 80, 20);
      doc.text('Nom :', 20, 40);
      doc.text('Prénom :', 80, 40);
      doc.rect(15, 30, 180, 15); // empty square

      doc.text('Contexte', 20, 60);
      doc.setFontSize(12);
      doc.text(this.plastron.modele.description, 20, 70);

      doc.line(15, 50, 200, 50); // horizontal line
      doc.addPage();
      doc.text( "Do you like that?",20,20);
      doc.save('a4.pdf'); */

      // Margins:
    }
  }
}
