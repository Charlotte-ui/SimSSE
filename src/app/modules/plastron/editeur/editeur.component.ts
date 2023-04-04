import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Trend,Event,Node, Link } from '../../core/models/node';
import { TypeVariable, VariablePhysio } from '../../core/models/variablePhysio';
import { NodeDialogComponent } from './editeur-graphe-nodal/node-dialog/node-dialog.component';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less']
})
export class EditeurComponent implements OnInit {

 trend1:Trend = {
  id:"1",
  name: 'chute sat',
  x: 300,
  y: 300,
  type:'trend',
  cible:'SpO2',
  pente:-1
}

trend2:Trend = {
  id:"2",
  name: 'acc respi',
  x: 800,
  y: 300,
  type:'trend',
  cible:'FR',
  pente:1
}
event:Event = {
  id:"3",
  name: 'Oxygéno.',
  x: 550,
  y: 100,
  type:'event',
  event:'oxygénothérapie'
}

start:Event = {
  id:"0",
  name: 'Start',
  x: 0,
  y: 0,
  type:'event',
  event:'start'
}

link1:Link = {
  id:"0",
  source: 3,
  target: 1,
  type:"link",
  start:false
}

link2:Link = {
  id:"1",
  source: 3,
  target: 2,
  type:"link",
  start:false
}

link3:Link = {
  id:"2",
  source: 0,
  target: 1,
  type:"link",
  start:true
}

link4:Link = {
  id:"3",
  source: 0,
  target: 2,
  type:"link",
  start:true
}

  SpO2:VariablePhysio = {
    id:"0",
    type:TypeVariable.SpO2,
    cible:98,
    rand:1
  }

  FR:VariablePhysio = {
    id:"1",
    type:TypeVariable.FR,
    cible:16,
    rand:1
  }

  targetVariable = [this.SpO2,this.FR]


  data = [this.start,this.trend1,this.trend2,this.event]

  links=[this.link1,this.link2,this.link3,this.link4]

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
