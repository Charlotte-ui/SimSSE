import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Node,Trend,Event, Link } from 'src/app/modules/core/models/node';


@Component({
  selector: 'app-node-dialog',
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.less']
})


export class NodeDialogComponent<T extends Node|Link> {

  form: FormGroup;
  nodes:(Trend|Event)[];
  node:T|Link;
  champs;

  numbers = ["x","y","pente"];
  hidden = ["x","y"];


  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<NodeDialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: [(T|Link),(Trend|Event)[]] ) {}

    ngOnInit() {
      this.nodes = this.data[1];
      this.node = this.data[0];
      this.form = this.fb.group(this.node);

      if (this.node.type == "link"){
        let link = this.node as Link;
        if (link.target) this.form.controls['target'].setValue(link.target.toString());
        if (link.source) this.form.controls['source'].setValue(link.source.toString());
      }
      else this.setChamp();

  }

  setChamp(){
    this.champs=Object.keys(this.node) as Array<keyof T>;
    let index = this.champs.indexOf("id", 0);
    if (index > -1) this.champs.splice(index, 1);
    index=-1;
    index = this.champs.indexOf("type", 0);
    if (index > -1) this.champs.splice(index, 1);
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

    public getType(champ:string){
      if (this.numbers.includes(champ)) return "number"
      if (champ == "couleur") return "color"
       return "text";
    }

    public isHidden(champ:string){
      if (this.hidden.includes(champ)) return true;
      return false;
    }

}







