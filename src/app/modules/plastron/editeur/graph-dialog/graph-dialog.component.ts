import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Graph } from 'src/app/modules/core/models/vertex/node';

@Component({
  selector: 'app-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.less']
})
export class GraphDialogComponent {

  form: FormGroup;
  graphs:Graph[];


  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<GraphDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Graph[] ) {}


    ngOnInit() {
      this.graphs = this.data;
      this.form = this.fb.group({graph:undefined});
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
