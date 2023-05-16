import { Component } from '@angular/core';
import { Modele } from '../../models/vertex/modele';
import { Scenario } from '../../models/vertex/scenario';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../models/vertex/variablePhysio';
import { Graph, Event } from '../../models/vertex/node';
import { ActivatedRoute } from '@angular/router';
import { ModeleService } from '../../services/modele.service';
import { Tag } from '../../models/vertex/tag';
import { TagService } from '../../services/tag.service';
import { Observable, forkJoin, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WaitComponent } from '../shared/wait/wait.component';
import { RegleService } from '../../services/regle.service';
import { Trigger } from '../../models/trigger';
import { NodeService } from 'src/app/services/node.service';
import { Graphable } from 'src/app/models/interfaces/graphable';

@Component({
  selector: 'app-modele',
  templateUrl: './modele.component.html',
  styleUrls: ['./modele.component.less'],
})
export class ModeleComponent implements Graphable {
  modele!: Modele;
  scenario: Scenario;
  targetVariable!: VariablePhysioInstance[];
  variablesTemplate: VariablePhysioTemplate[] = [];
  graph!: Graph;
  allTags!: Tag[];


  newTags: Tag[];
  tagsToDelete: Tag[];

  // implement Graphable
  nodeToUpdate: string[] = [];
  nodeToDelete: string[] = [];
  linkToUpdate: string[] = [];
  linkToDelete: string[] = [];
  changesToSave = false;
  newModele: Modele;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private modelService: ModeleService,
    private tagService: TagService,
    private regleService: RegleService,
    private nodeService: NodeService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((response) => {
      this.modele = response['data'];
      this.initTrigger();
    });

    this.initVariables();

    /**
     * init tags
     */
    this.tagService.getAllTags('modele').subscribe((response: Tag[]) => {
      this.allTags = response;
    });
  }

  initTrigger() {
    this.modelService.getTrigger(this.modele.id).subscribe((result: any) => {
      this.modele.triggeredEvents = result.$a.map(
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
      .subscribe((variablesTemplates: VariablePhysioTemplate[]) => {
        this.variablesTemplate = variablesTemplates;
        this.targetVariable = variablesTemplates.map(
          (varTemp: VariablePhysioTemplate) => {
            let variable = new VariablePhysioInstance(varTemp);
            variable.cible = varTemp.defaultValue;
            variable.template = varTemp.id;

            return variable;
          }
        );
        console.log('varTemp');
        console.log(variablesTemplates);
        console.log('varInst');
        console.log(this.targetVariable);
        this.targetVariable = [...this.targetVariable];
      });
  }

  save() {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);

    console.log('this.modele ', this.modele);
    if (this.newModele && this.newModele.description != this.modele.description)
      requests.push(this.modelService.updateModele(this.newModele));

    // save the tags
    if (this.newTags && this.newTags.length > 0)
      requests.push(
        this.tagService.addTagsToSource(this.newTags, this.modele.id, 'modele')
      );

    if (this.tagsToDelete && this.tagsToDelete.length > 0)
      requests.push(
        this.tagService.deleteTagsFromSource(this.tagsToDelete, this.modele.id)
      );

    requests.push(
      this.nodeService.updateGraph(
        this.modele.graph,
        this.nodeToUpdate,
        this.nodeToDelete,
        this.linkToUpdate,
        this.linkToDelete
      )
    );

    forkJoin(requests).subscribe((value) => {
      console.log(value);
      this.changesToSave = false;
      this.dialog.closeAll();
    });
  }

  changeModeleRef(newModele) {
    // this.plastronService.changeModelRef(this.plastron,newModele);
  }
}
