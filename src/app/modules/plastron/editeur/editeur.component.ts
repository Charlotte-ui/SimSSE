import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Trend,Event,Node, Link, Graph } from '../../core/models/node';
import {  VariablePhysio, VariablePhysioInstance } from '../../core/models/variablePhysio';
import { NodeDialogComponent } from './editeur-graphe-nodal/node-dialog/node-dialog.component';
import { Target } from '@angular/compiler';
import { RegleService } from '../../core/services/regle.service';
import { NodeService } from '../../core/services/node.service';
import { GraphDialogComponent } from './graph-dialog/graph-dialog.component';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less']
})
export class EditeurComponent implements OnInit {




  @Input() targetVariable:VariablePhysioInstance[];
  @Input() data:(Event|Trend)[];
  @Input() links:Link[];


  triggeredEvents = [[0,0],[50,3]]

  events!:Event[];

  graphs!:Graph[];


  constructor(public dialog: MatDialog, public reglesService:RegleService, public nodeService:NodeService) { }

  ngOnInit(): void {

    this.reglesService.getEventGabarit().subscribe(
      (response) => {
        this.events = response as Event[];
      }
    );

    this.nodeService.getGraphGabarit().subscribe(
      (response) => {
        this.graphs = response;
      }
    );

  }

  addElement(element:string){
    let indice = this.data.length ;
    let x = Math.floor(Math.random() * 800);
    let y = Math.floor(Math.random() * 800);

    switch (element){
      case 'link':
        return this.createLink();
      case 'event':
        let event = {
          id:indice.toString(),
          name: 'Event '+indice,
          x: x,
          y: y,
          type:'event',
          event:'oxygénothérapie'
        } as Event
        return this.createNode(event);
      case 'trend':
        let trend = {
          id:indice.toString(),
          name: 'Tendance '+indice,
          x: x,
          y: y,
          type:'trend',
          cible:'SpO2',
          pente:-1
        } as Trend
        return this.createNode(trend);
      case 'group':
        return this.createGroup();
    }
  }



  createNode(newNode:Trend|Event){

    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: [newNode,this.data],
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);

      if (result == "delete"){

      }
      else if (result){
        this.data.push(newNode)
        this.data = [...this.data] // force change detection by forcing the value reference update
        console.log(newNode);

      }

    });
  }


  createLink(){
    let index = this.links.length;
    let link:Link = {id:index.toString(),source:undefined,target:undefined,type:"link",start:true};

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

  createGroup(){
    const dialogRef = this.dialog.open(GraphDialogComponent, {
      data: this.graphs,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);

      if (result == "delete"){

      }
      else if (result){

        let graph = result.graph;
        graph.id = this.data.length;
        graph.gabarit = false;


        this.data.push(result.graph)

        console.log(this.data)
        this.data = [...this.data] // TODO force change detection by forcing the value reference update
        console.log(result.graph);

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
