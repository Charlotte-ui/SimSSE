import { Component } from '@angular/core';
import { Modele } from '../core/models/vertex/modele';
import { Scenario } from '../core/models/vertex/scenario';
import { VariablePhysioInstance, VariablePhysioTemplate } from '../core/models/vertex/variablePhysio';
import { Graph } from '../core/models/vertex/node';
import { ActivatedRoute } from '@angular/router';
import { ModeleService } from '../core/services/modele.service';
import { Tag } from '../core/models/vertex/tag';
import { TagService } from '../core/services/tag.service';
import { Observable, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WaitComponent } from '../shared/wait/wait.component';

@Component({
  selector: 'app-modele',
  templateUrl: './modele.component.html',
  styleUrls: ['./modele.component.less']
})
export class ModeleComponent {
  modele!:Modele;
  scenario:Scenario;
  targetVariable!:VariablePhysioInstance[];
  variablesTemplate: VariablePhysioTemplate[] = [];
  graph!:Graph;
  allTags!: Tag[];

  changesToSave = false;
  newModel:boolean;
  newTags:Tag[];
  tagsToDelete:Tag[];



  constructor(private route: ActivatedRoute, public dialog: MatDialog, private modelService:ModeleService,private tagService:TagService) { }
 
  ngOnInit(): void {
    this.route.data.subscribe(
      (response) => {
        this.modele = response['data'];
      }
    );

    /**
     * init tags
     */
    this.tagService.getAllTags('modele').subscribe((response: Tag[]) => {
      this.allTags = response;
    });
  }

    save() {
    let requests: Observable<any>[] = [];
    this.dialog.open(WaitComponent);
    if (this.newModel)
      requests.push(this.modelService.updateModele(this.modele));

    // save the tags
    if (this.newTags.length > 0)
      requests.push(this.tagService.addTagsToSource(this.newTags, this.modele.id,'modele'));

    if (this.tagsToDelete.length > 0)
      requests.push(this.tagService.deleteTagsFromSource(this.tagsToDelete, this.modele.id));

    forkJoin(requests).subscribe((value) => {
      this.changesToSave = false;
      this.dialog.closeAll();
    });
  }
    
  changeModeleRef(newModele){
   // this.plastronService.changeModelRef(this.plastron,newModele);
  }
}
