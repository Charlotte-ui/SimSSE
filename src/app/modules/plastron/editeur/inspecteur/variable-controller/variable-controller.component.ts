import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VariablePhysio } from 'src/app/modules/core/models/variablePhysio';

@Component({
  selector: 'app-variable-controller',
  templateUrl: './variable-controller.component.html',
  styleUrls: ['./variable-controller.component.less']
})
export class VariableControllerComponent implements OnInit{

  panelOpenState = true
  isOpened = false
  color = "blue"
  form: FormGroup;
  _variable:VariablePhysio;


get variable():  VariablePhysio {
  return this._variable;
}

@Input() set variable(value:VariablePhysio ) {
    this._variable = value;
    this.form = this.fb.group(value);

  }

@Output() newVariable = new EventEmitter<VariablePhysio>();



  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  changeValues(){
    console.log(this.form.value);
    this.newVariable.emit(this.form.value);

  }


}
