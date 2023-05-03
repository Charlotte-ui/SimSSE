import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Trend } from 'src/app/modules/core/models/node';
import { VariablePhysio } from 'src/app/modules/core/models/variablePhysio';

@Component({
  selector: 'app-inspecteur',
  templateUrl: './inspecteur.component.html',
  styleUrls: ['./inspecteur.component.less']
})
export class InspecteurComponent implements OnInit {

  @Input() variables:VariablePhysio[];
  @Input() trends:Trend[];

  @Output() updateVariable = new EventEmitter<(VariablePhysio|number)[]>();

  constructor() { }

  ngOnInit(): void {
  }

  setNewVariable(oldVar:VariablePhysio,newVar:VariablePhysio){
    const index = this.variables.indexOf(oldVar);
    if (index > -1) this.variables[index] = newVar;
    this.updateVariable.emit([newVar,index]);
  }

  getTrendByCible(name:string):Trend[]{
    let res = [];

    this.trends.forEach(trend => {
      if (trend.target == name) res.push(trend);
    });

    return res;
  }

}
