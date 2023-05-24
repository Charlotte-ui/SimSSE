import { Component } from '@angular/core';
import { Modele, ModeleSaverArrays } from '../../models/vertex/modele';
import { Scenario } from '../../models/vertex/scenario';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../models/vertex/variablePhysio';
import { Graph } from '../../models/vertex/node';
import { ActivatedRoute, Data } from '@angular/router';
import { ModeleService } from '../../services/modele.service';
import { Tag } from '../../models/vertex/tag';
import { TagService } from '../../services/tag.service';
import { Observable, forkJoin, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WaitComponent } from '../shared/wait/wait.component';
import { RegleService } from '../../services/regle.service';
import { Trigger } from '../../models/trigger';
import { NodeService } from 'src/app/services/node.service';
import { ModeleDialogComponent } from './modele-dialog/modele-dialog.component';

@Component({
  selector: 'app-modele',
  templateUrl: './modele.component.html',
  styleUrls: ['./modele.component.less'],
})
export class ModeleComponent {
  modele!: Modele;
  scenario: Scenario;
  targetVariable!: VariablePhysioInstance[];
  variablesTemplate: VariablePhysioTemplate[] = [];
  graph!: Graph;
  allTags!: Tag[];
  changesToSave: boolean = false;
  saver: ModeleSaverArrays;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private modelService: ModeleService,
    private tagService: TagService,
    private regleService: RegleService,
    private nodeService: NodeService
  ) {
    this.saver = Modele.initSaver();
  }

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap((response: Data) => {
          this.modele = response['data'];
          this.initTrigger();
          this.initVariables();
          /**
           * init tags
           */
          return this.tagService.getAllTags('modele');
        })
      )
      .subscribe((tags: Tag[]) => {
        this.allTags = tags;
      });
  }

  initTrigger() {
    this.modelService
      .getTrigger(this.modele.id)
      .subscribe((triggers: Trigger[]) => {
        this.modele.triggeredEvents = triggers;
      });
  }

  /**
   * init target variables
   */
  initVariables() {
    this.regleService
      .getVariableTemplate()
      .subscribe((variablesTemplates: VariablePhysioTemplate[]) => {
        this.variablesTemplate = variablesTemplates;
        this.targetVariable = variablesTemplates.map(
          (varTemp: VariablePhysioTemplate) => {
            let variable = new VariablePhysioInstance(varTemp);
            variable.cible = varTemp.defaultValue;
            variable.template = varTemp.id;
            variable.rand = 0;
            return variable;
          }
        );
        this.targetVariable = [...this.targetVariable];
      });
  }

  save() {
    this.dialog.open(WaitComponent);

    forkJoin(this.savingModeleRequest()).subscribe((value) => {
      this.changesToSave = false;

      this.dialog.closeAll();
      this.saver = Modele.initSaver();
    });
  }

  saveAsNewModel(event: boolean) {
    if (event) {
      let newModel = structuredClone(this.modele);
      newModel.title = '';
      delete newModel.id;
      delete newModel.template;
      const dialogRef = this.dialog.open(ModeleDialogComponent, {
        data: [
          newModel,
          'Enregistrer en tant que nouveau modèle',
          false,
        ],
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.dialog.open(WaitComponent);

        if (result == undefined) {
          this.dialog.closeAll();
          return;
        }
        if (!this.changesToSave) {
          this.modelService
            .createNewModeleTemplate(this.modele, result)
            .subscribe((res) => {
              console.log('res ', res);
              this.dialog.closeAll();
            });
        } else {
          forkJoin(this.savingModeleRequest())
            .pipe(
              switchMap((value) =>
                this.modelService.createNewModeleTemplate(this.modele, result)
              )
            )
            .subscribe((res) => {
              this.changesToSave = false;
              this.saver = Modele.initSaver();
              this.dialog.closeAll();
            });
        }
      });
    }
  }

  savingModeleRequest(): Observable<any>[] {
    let requests: Observable<any>[] = this.modele.save(
      this.saver,
      this.tagService,
      this.modelService,
      this.nodeService
    );
    return requests;
  }
}
