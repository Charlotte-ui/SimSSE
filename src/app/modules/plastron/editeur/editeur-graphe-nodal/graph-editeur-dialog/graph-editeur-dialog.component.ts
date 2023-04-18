import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Graph, Trend,Event,Link } from 'src/app/modules/core/models/node';

@Component({
  selector: 'app-graph-editeur-dialog',
  templateUrl: './graph-editeur-dialog.component.html',
  styleUrls: ['./graph-editeur-dialog.component.less']
})
export class GraphEditeurDialogComponent {

  dataGraph:(Event|Trend)[];
  linksGraph:Link[];
  nom:string;

  constructor(public dialogRef: MatDialogRef<GraphEditeurDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Graph ) {


    }

    ngOnInit() {
      console.log("GraphDialogComponent")

      this.dataGraph = this.data.nodes as (Event|Trend)[];
      console.log(this.dataGraph)

      this.linksGraph = this.data.links;

      console.log(this.linksGraph)

      this.nom = this.data.name;

  }

  updateNodes(event){
    console.log("updateNodes")
    console.log(event)
    this.dataGraph = [...event]; //TODO link to database

  }

}
