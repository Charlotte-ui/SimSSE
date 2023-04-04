import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VariablePhysio } from 'src/app/modules/core/models/variablePhysio';

@Component({
  selector: 'app-inspecteur',
  templateUrl: './inspecteur.component.html',
  styleUrls: ['./inspecteur.component.less']
})
export class InspecteurComponent implements OnInit {

  @Input() variables:VariablePhysio[];
  @Output() newVariables = new EventEmitter<VariablePhysio[]>();

  constructor() { }

  ngOnInit(): void {
  }

  setNewVariable(oldVar:VariablePhysio,newVar:VariablePhysio){
    const index = this.variables.indexOf(oldVar);
    if (index > -1) this.variables[index] = newVar;
    this.newVariables.emit(this.variables);
  }

}
