import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Trend,Event,Node, Link } from '../../core/models/node';
import { TypeVariable, VariablePhysio } from '../../core/models/variablePhysio';
import { NodeDialogComponent } from './editeur-graphe-nodal/node-dialog/node-dialog.component';
import { Target } from '@angular/compiler';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less']
})
export class EditeurComponent implements OnInit {




  @Input() targetVariable:VariablePhysio[];
  @Input() data:(Event|Trend)[];
  @Input() links:Link[];

  


  events = [[0,0],[50,3]]

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  addNode(nodeType:string){

    if (nodeType == "link"){
      return this.createLink();
    }


    console.log(nodeType)
    let newNode:Trend|Event ;

    let indice = this.data.length ;
    let x = Math.floor(Math.random() * 800);
    let y = Math.floor(Math.random() * 800);

    if (nodeType == "trend"){
      newNode = {
        id:indice.toString(),
        name: 'Tendance '+indice,
        x: x,
        y: y,
        type:'trend',
        cible:'SpO2',
        pente:-1
      } as Trend
    }
    else {
      newNode = {
        id:indice.toString(),
        name: 'Event '+indice,
        x: x,
        y: y,
        type:'event',
        event:'oxygénothérapie'
      } as Event    
    }

    this.data.push(newNode)
    this.data = [...this.data] // force change detection by forcing the value reference update

    console.log(newNode);


  }


  createLink(){

    let index = this.links.length;
    let link:Link = {id:index.toString(),source:undefined,target:undefined,type:"link",start:false};

    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: [link,this.data],
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);

      if (result == "delete"){
    
      }
      else if (result){
        this.links.push(result);
        this.links = [...this.links] // force change detection by forcing the value reference update
      }

    });
  }

  updateNodes(event){
    console.log("updateNodes")
    console.log(event)
    this.data = [...event];

  }

  updateVariables(event){
    console.log("updateVariables")
    console.log(event)
    this.targetVariable = [...event];

  }

}
