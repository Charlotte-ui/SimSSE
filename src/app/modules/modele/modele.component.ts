import { Component } from '@angular/core';
import { Modele } from '../core/models/vertex/modele';
import { Scenario } from '../core/models/vertex/scenario';
import { VariablePhysioInstance } from '../core/models/vertex/variablePhysio';
import { Graph } from '../core/models/vertex/node';
import { ActivatedRoute } from '@angular/router';
import { ModeleService } from '../core/services/modele.service';

@Component({
  selector: 'app-modele',
  templateUrl: './modele.component.html',
  styleUrls: ['./modele.component.less']
})
export class ModeleComponent {
  modele!:Modele;
  scenario:Scenario;
  targetVariable!:VariablePhysioInstance[];
  graph!:Graph;

  constructor(private route: ActivatedRoute, private modelService:ModeleService,) { }
 
  ngOnInit(): void {
    this.route.data.subscribe(
      (response) => {
        this.modele = response['data'];
      }
    );
  }
    
  changeModeleRef(newModele){
   // this.plastronService.changeModelRef(this.plastron,newModele);
  }
}
