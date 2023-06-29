import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Button, IButton } from 'src/app/functions/display';
import { Trend } from 'src/app/models/vertex/node';
import { VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';

@Component({
  selector: 'app-add-multiple-trends-dialog',
  templateUrl: './add-multiple-trends-dialog.component.html',
  styleUrls: ['./add-multiple-trends-dialog.component.less'],
})
export class AddMultipleTrendsDialogComponent {
  button: IButton;
  variables: Map<string,VariablePhysioTemplate>;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMultipleTrendsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.variables = VariablePhysioTemplate.variables;
    this.button = Button.getButtonByType('addMultiple');
  }

  ngOnInit() {
    let trendsParamaters = {};

    this.variables.forEach((variable: VariablePhysioTemplate) => {
      trendsParamaters[variable.id] = 0;
    });
    this.form = this.fb.group(trendsParamaters);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}
