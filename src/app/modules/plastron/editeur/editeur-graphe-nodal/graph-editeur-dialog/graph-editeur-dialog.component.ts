import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Graph, Trend,Event,Link,Node } from 'src/app/modules/core/models/vertex/node';

@Component({
  selector: 'app-graph-editeur-dialog',
  templateUrl: './graph-editeur-dialog.component.html',
  styleUrls: ['./graph-editeur-dialog.component.less']
})
export class GraphEditeurDialogComponent {

  graph:Graph;

  constructor(public dialogRef: MatDialogRef<GraphEditeurDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Graph ) {


    }

    ngOnInit() {
      console.log("GraphDialogComponent")

      this.graph = this.data;

  }

  updateNodes(event){
    console.log("updateNodes")
    console.log(event)
    this.graph.nodes = [...event]; //TODO link to database

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }

  delete() {
    this.dialogRef.close({delete:true,id:this.graph.id});
  }

}
