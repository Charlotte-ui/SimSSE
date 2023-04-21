import { Component } from '@angular/core';
import { VariablePhysio, VariablePhysioGabarit } from '../core/models/variablePhysio';
import { RegleService } from '../core/services/regle.service';
import { Event } from '../core/models/node';


@Component({
  selector: 'app-regles',
  templateUrl: './regles.component.html',
  styleUrls: ['./regles.component.less']
})



export class ReglesComponent {

  variables!: VariablePhysioGabarit[];
  variablesDetails!: VariablePhysio[];
  moyennesAge!:any[];
  moyennesSexe!:any[];
  events!: Partial<Event>[];


  constructor(public regleService:RegleService){}

  ngOnInit(): void {
    this.regleService.getVariableGarbarit().subscribe(
      (response) => {
        this.variables = response;
        this.variablesDetails = [];
        this.moyennesAge = [];
        this.moyennesSexe = [];

        this.variables.forEach(variable => {
          let v = structuredClone(variable);

          let ma = this.initTableMoyenne(v.name,v.moyennesAge,v.sdAge,true);
          let ms = this.initTableMoyenne(v.name,v.moyennesSexe,v.sdSexe,false);

          delete v.moyennesAge;
          delete v.moyennesSexe;
          delete v.sdSexe;
          delete v.sdAge;
          this.variablesDetails.push(v);
          this.moyennesAge.push(ma);
          this.moyennesSexe.push(ms);


        });

      }
    );

    this.regleService.getBioEvents().subscribe(
      (response) => {
        this.events = response;
      }
    );
  }

  initTableMoyenne(nom:string,moyennes,sd,age:boolean){
    let m = {"nom":nom}
    moyennes.forEach((moyenne,i) => {
      let indice:string;
      if (age) indice=10*i+"-"+(i+1)*10
      else indice = (i==0)?"Homme":"Femme";
      m[indice] = moyenne
    });
    m["sd"]=sd;
    return m;
  }

  addVariable(variable){
    this.regleService.createVariable(variable);

  }

  addEvent(event){
    this.regleService.createEvent(event);

  }



}
