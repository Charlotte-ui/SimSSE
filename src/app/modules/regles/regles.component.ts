import { Component } from '@angular/core';
import {
  VariablePhysio,
  VariablePhysioTemplate,
} from '../../models/vertex/variablePhysio';
import { RegleService } from '../../services/regle.service';
import { Action, BioEvent, Categorie } from 'src/app/models/vertex/event';
import { Vertex } from 'src/app/models/vertex/vertex';




@Component({
  selector: 'app-regles',
  templateUrl: './regles.component.html',
  styleUrls: ['./regles.component.less'],
})
export class ReglesComponent {
  variables!: VariablePhysioTemplate[];
  variablesDetails!: VariablePhysio[];
  moyennesAge!: any[];
  events!: BioEvent[];
  actions!: Action[];
  categories!: Categorie[];


  VariablePhysioTemplate = VariablePhysioTemplate;
  Action = Action;
  BioEvent = BioEvent;

  constructor(public regleService: RegleService) {}

  ngOnInit(): void {
    this.regleService.getVariableTemplate().subscribe((response) => {
      this.variables = response;
      this.variablesDetails = [];
      this.moyennesAge = [];

      this.variables.forEach((variable) => {
        let v = structuredClone(variable);
        let ma = this.initTableMoyenne(v.name, v.moyennesAge, v.sdAge, true);
        delete v.moyennesAge;
        delete v.sdAge;
        this.variablesDetails.push(v);
        this.moyennesAge.push(ma);
      });
    });

    this.regleService.getBioEvents().subscribe((response: BioEvent[]) => {
      this.events = response;
    });

    this.regleService.getActions().subscribe((response: Action[]) => {
      this.actions = response;
    });


    this.regleService.getCategories().subscribe((response: Categorie[]) => {
      console.log('response ',response)
      this.categories = response;
    });
    

  }

  initTableMoyenne(name: string, moyennes, sd, age: boolean) {
    let m = { name: name };
    moyennes.forEach((moyenne, i) => {
      let indice: string;
      if (age) indice = 10 * i + '-' + (i + 1) * 10;
      else indice = i == 0 ? 'Homme' : 'Femme';
      m[indice] = moyenne;
    });
    m['sd'] = sd;
    return m;
  }
}
