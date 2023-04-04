import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Trend,Event, Link } from 'src/app/modules/core/models/node';


@Component({
  selector: 'app-node-dialog',
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.less']
})


export class NodeDialogComponent {

  form: FormGroup;
  nodes:(Trend|Event)[];
  node:Trend|Event|Link;

  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<NodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [(Trend|Event|Link),(Trend|Event)[]] ) {}

    ngOnInit() {
      this.nodes = this.data[1];
      this.node = this.data[0];
      this.form = this.fb.group(this.node);

      if (this.node.type == "link"){
        let link = this.node as Link;
        this.form.controls['target'].setValue(link.target.toString());
        this.form.controls['source'].setValue(link.source.toString());
      }

  }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    save() {
      this.dialogRef.close(this.form.value);
    }

    delete() {
      this.dialogRef.close("delete");
    }

}







