import { Component } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Observable, forkJoin, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NodeService } from 'src/app/services/node.service';
import { ModeleDialogComponent } from './modele-dialog/modele-dialog.component';
import { Trigger } from 'src/app/models/trigger';
import { Modele } from 'src/app/models/vertex/modele';
import { Graph } from 'src/app/models/vertex/node';
import { Scenario } from 'src/app/models/vertex/scenario';
import { Tag } from 'src/app/models/vertex/tag';
import { VariablePhysioInstance, VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';
import { WaitComponent } from 'src/app/modules/shared/wait/wait.component';
import { ModeleService } from 'src/app/services/modele.service';
import { RegleService } from 'src/app/services/regle.service';
import { TagService } from 'src/app/services/tag.service';

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
  editorInit:boolean = false;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private modelService: ModeleService,
    private tagService: TagService,
    private regleService: RegleService,
    private nodeService: NodeService
  ) {
  }

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap((response: Data) => {
          this.modele = response['data'];
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
      
          this.modelService
            .createNewModeleTemplate(this.modele, result)
            .subscribe((res) => {
              this.dialog.closeAll();
            });
       
      });
    }
  }

    onTabChanged(event){
    console.log("onTabChanged ",event)
    if(event.index === 1) this.editorInit = true;

  }

}
