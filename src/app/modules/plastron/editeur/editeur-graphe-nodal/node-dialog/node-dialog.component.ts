import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Trend,Event } from 'src/app/modules/core/models/node';




@Component({
  selector: 'app-node-dialog',
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.less']
})



export class NodeDialogComponent {

  form: FormGroup;

  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<NodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Trend|Event) {}

    ngOnInit() {
      this.form = this.fb.group(this.data);
  }
  
    onNoClick(): void {
      this.dialogRef.close();
    }


    save() {
      this.dialogRef.close(this.form.value);
  }
}







