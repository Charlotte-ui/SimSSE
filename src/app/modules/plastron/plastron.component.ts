import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Plastron } from '../../models/vertex/plastron';
import { ModeleService } from '../../services/modele.service';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScenarioService } from '../../services/scenario.service';
import { Groupe } from '../../models/vertex/groupe';
import { TagService } from '../../services/tag.service';
import { Trigger } from '../../models/trigger';
import { Observable, concat, forkJoin, of, switchMap, zipAll } from 'rxjs';
import { Tag } from '../../models/vertex/tag';
import { Pdf } from '../../models/pdf';
import { Curve } from '../../functions/curve';
import { WaitComponent } from '../shared/wait/wait.component';
import { ConfirmDeleteDialogComponent } from '../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { NodeService } from 'src/app/services/node.service';
import { ModeleDialogComponent } from '../scenario-editor/modeles/modele/modele-dialog/modele-dialog.component';

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
  editorInit:boolean = false;

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
      .subscribe((response: [Plastron, Scenario]) => {
        this.scenario = response[1];
        this.initVariables();
      });

    /**
     * init tags
     */
    this.tagService.getAllTags('modele').subscribe((response: Tag[]) => {
      this.allTags = response;
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


  changeCurves(event) {
    if (event) {
      this.curves = event;
    }
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
/*         if (!this.modeleToSave) {
          this.modelService
            .createNewModeleTemplate(this.plastron.modele, result)
            .subscribe((res) => {
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
              this.dialog.closeAll();
            });
        } */
      });
    }
  }

  save() {


      this._snackBar.open(
        'Modifications du plastron ' +
          this.plastron.modele.title +
          ' enregistrées !',
        'Ok',
        {
          duration: 3000,
        })

  }

  deriveFromModele() {
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

  onTabChanged(event){
    console.log("onTabChanged ",event)
    if(event.index === 1) this.editorInit = true;

  }

  exportAsPdf(event: boolean) {
    if (event) {
      new Pdf(this.plastron.modele, this.plastron.profil, this.curves);
    }
  }
}
