import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Trend } from 'src/app/models/vertex/node';
import {
  VariablePhysio,
  VariablePhysioInstance,
} from 'src/app/models/vertex/variablePhysio';

@Component({
  selector: 'app-variable-controller',
  templateUrl: './variable-controller.component.html',
  styleUrls: ['./variable-controller.component.less'],
})
export class VariableControllerComponent implements OnInit {
  panelOpenState = true;
  isOpened = false;
  color = 'blue';
  form: FormGroup;
  _variable: VariablePhysioInstance;
  _tendances: Trend[];

  get variable(): VariablePhysioInstance {
    return this._variable;
  }

  @Input() set variable(value: VariablePhysioInstance) {
    this._variable = value;
    this.form = this.fb.group(value);
  }

  get tendances(): Trend[] {
    return this._tendances;
  }

  @Input() set tendances(value: Trend[]) {
    this._tendances = value;
  }

  @Input() disabled:boolean=false;

  @Output() newVariable = new EventEmitter<VariablePhysioInstance>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}

  changeValues() {
    this.newVariable.emit(this.form.value);
  }
}
