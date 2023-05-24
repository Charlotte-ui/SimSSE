import { Component } from '@angular/core';
import { Modele, ModeleSaverArrays } from '../../models/vertex/modele';
import { Scenario } from '../../models/vertex/scenario';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../models/vertex/variablePhysio';
import { Graph  } from '../../models/vertex/node';
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
    let requests: Observable<any>[] = this.modele.save(
      this.saver,
      this.tagService,
      this.modelService,
      this.nodeService
    );

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;

      this.dialog.closeAll();
      this.saver = Modele.initSaver();
    });
  }

  changeModeleRef(newModele) {
    // this.plastronService.changeModelRef(this.plastron,newModele);
  }
}
