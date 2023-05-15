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

  changesToSave = false;
  newModel: boolean;
  newTags: Tag[];
  tagsToDelete: Tag[];

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private modelService: ModeleService,
    private tagService: TagService,
    private regleService:RegleService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((response) => {
      this.modele = response['data'];
       this.initTrigger()
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
    this.modelService
      .getTrigger(this.modele.id)
      .subscribe((result: any) => {
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
          this.targetVariable = variablesTemplates.map((varTemp:VariablePhysioTemplate)=>{
            let variable = new VariablePhysioInstance(varTemp);
            variable.cible = varTemp.defaultValue
            variable.template = varTemp.id;

            return variable;
          })
          console.log("varTemp")
          console.log(variablesTemplates)
          console.log("varInst")
          console.log(this.targetVariable)
          this.targetVariable = [... this.targetVariable]
        });
  }

  save() {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);
    if (this.newModel)
      requests.push(this.modelService.updateModele(this.modele));

    // save the tags
    if (this.newTags.length > 0)
      requests.push(
        this.tagService.addTagsToSource(this.newTags, this.modele.id, 'modele')
      );

    if (this.tagsToDelete.length > 0)
      requests.push(
        this.tagService.deleteTagsFromSource(this.tagsToDelete, this.modele.id)
      );

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;
      this.dialog.closeAll();
    });
  }

  changeModeleRef(newModele) {
    // this.plastronService.changeModelRef(this.plastron,newModele);
  }
}
