import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Graph, Trend, Event, Link, Node } from 'src/app/models/vertex/node';
import { VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';

@Component({
  selector: 'app-graph-editeur-dialog',
  templateUrl: './graph-editeur-dialog.component.html',
  styleUrls: ['./graph-editeur-dialog.component.less'],
})
export class GraphEditeurDialogComponent {
  graph: Graph;
  variablesTemplate!: VariablePhysioTemplate[];
  
  
  constructor(
    public dialogRef: MatDialogRef<GraphEditeurDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [Graph,VariablePhysioTemplate[]]
  ) {}

  ngOnInit() {
    this.graph = this.data[0];
    this.variablesTemplate =  this.data[1];
  }

  updateNodes(event) {
    this.graph.nodes = [...event]; //TODO link to database
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.graph);
  }

  delete() {
    this.dialogRef.close({ delete: true, id: this.graph.id });
  }
}
