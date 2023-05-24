import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Plastron } from '../../models/vertex/plastron';
import { ModeleService } from '../../services/modele.service';
import { Modele, ModeleSaverArrays } from '../../models/vertex/modele';
import { Event } from '../../models/vertex/node';
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
import { Curve } from '../../functions/curve';
import { WaitComponent } from '../shared/wait/wait.component';
import { ConfirmDeleteDialogComponent } from '../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { NodeService } from 'src/app/services/node.service';

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

  changesToSave: boolean = false;
  variableToSave: string[] = [];
  modeleToSave: boolean = false;
  saver: ModeleSaverArrays;
  oldVariables: VariablePhysioInstance[];

  constructor(
    private route: ActivatedRoute,
    private modelService: ModeleService,
    public regleService: RegleService,
    public plastronService: PlastronService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private scenarioService: ScenarioService,
    private tagService: TagService,
    private profilService: ProfilService,
    private nodeService: NodeService
  ) {
    this.saver = Modele.initSaver();
  }

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
      .subscribe((response: [Plastron, Scenario]) => {
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
      .subscribe((triggers: Trigger[]) => {
        this.plastron.modele.triggeredEvents = triggers;
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
        this.oldVariables = structuredClone(variables);

        variables.forEach((variable: VariablePhysioInstance, index: number) => {
          if (variable.id == '')
            this.profilService
              .createVariableCible(
                this.variablesTemplate[index],
                this.plastron.profil
              )
              .subscribe((res: VariablePhysioInstance) => {
                this.plastron.profil.targetVariable[index] = res;
                this.plastron.profil.targetVariable = [
                  ...this.plastron.profil.targetVariable,
                ];
              });
          // si la variable cible n'existe pas, on la crée
          else {
            variable.name = this.variablesTemplate[index].name;
            variable.color = this.variablesTemplate[index].color;
            variable.template = this.variablesTemplate[index].id;
          }
        });
      });
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
          false,
        ],
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.dialog.open(WaitComponent);

        if (result == undefined) {
          this.dialog.closeAll();
          return;
        }

        // CAS OU IL N'Y A RIEN A ENREGISTRER
        // TODO ; disable le bt si il y a eu des modif
        if (!this.modeleToSave) {
          this.modelService
            .createNewModeleTemplate(this.plastron.modele, result)
            .subscribe((res) => {
              console.log('res ', res);
              this.dialog.closeAll();
            });
        } else {
          forkJoin(this.savingPlastronRequest())
            .pipe(
              switchMap((value) =>
                this.modelService.createNewModeleTemplate(
                  this.plastron.modele,
                  result
                )
              )
            )
            .subscribe((res) => {
              this.changesToSave = false;
              this.modeleToSave = false;
              this.saver = Modele.initSaver();
              this.dialog.closeAll();
            });
        }
      });
    }
  }

  save() {
    this.dialog.open(WaitComponent);
    let waitBeforeClosing =
      this.modeleToSave && typeof this.plastron.modele.template !='string' ;
    forkJoin(this.savingPlastronRequest()).subscribe((value) => {
      this.changesToSave = false;
      if (waitBeforeClosing) this.dialog.closeAll();
      this.saver = Modele.initSaver();
      this.modeleToSave = false;

      this._snackBar.open(
        'Modifications du plastron ' +
          this.plastron.modele.title +
          ' enregistrées !',
        'Ok',
        {
          duration: 3000,
        }
      );
    });
  }

  savingPlastronRequest(): Observable<any>[] {
    let requests: Observable<any>[] = [];
    let requestsProfil: Observable<any>[] = [];

    if (this.modeleToSave) {
      if (this.plastron.modele.template) {
        this.deriveFromModele();
      } else
        requests = this.plastron.modele.save(
          this.saver,
          this.tagService,
          this.modelService,
          this.nodeService
        );
    }

    if (this.variableToSave && this.variableToSave.length > 0)
      requestsProfil = this.profilService.updateVariables(
        this.plastron.profil,
        this.oldVariables,
        this.variableToSave
      );

    return requests.concat(requestsProfil);
  }

  deriveFromModele() {
    console.log('deriveFromModele');
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: [
        'Modifier le modèle traumato-physiologique ' +
          this.plastron.modele.title,
        'Le plastron suit actuellement le modèle ' +
          this.plastron.modele.title +
          '. En enregistrant ces modifications, il ne suivre plus exactement ce modèle. Voulez-vous confirmer ces modifications ? ',
      ],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.plastronService.changeModeleRef(this.plastron).subscribe((res) => {
          this.dialog.closeAll();
          //  location.reload(); TODO : wait for all the calls before reload
        });
      }
    });
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
