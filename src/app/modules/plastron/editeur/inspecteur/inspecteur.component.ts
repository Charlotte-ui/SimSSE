import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Trend } from 'src/app/models/vertex/node';
import { VariablePhysio, VariablePhysioInstance } from 'src/app/models/vertex/variablePhysio';

@Component({
  selector: 'app-inspecteur',
  templateUrl: './inspecteur.component.html',
  styleUrls: ['./inspecteur.component.less']
})
export class InspecteurComponent implements OnInit {

  @Input() variables:VariablePhysioInstance[];
  @Input() trends:Trend[];
  @Input() disabled:boolean=false;


  @Output() updateVariable = new EventEmitter<[VariablePhysioInstance,number]>();

  constructor() { }

  ngOnInit(): void {
  }

  setNewVariable(oldVar:VariablePhysioInstance,newVar:VariablePhysioInstance){
    const index = this.variables.indexOf(oldVar);
    //if (index > -1) this.variables[index] = newVar;
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
