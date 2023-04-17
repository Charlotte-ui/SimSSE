import { Component, OnInit, Inject, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption, util } from 'echarts';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { Trend,Event, Link, Graph ,Node} from 'src/app/modules/core/models/node';
import * as echarts from 'echarts/types/dist/echarts';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';
import { GraphEditeurDialogComponent } from './graph-editeur-dialog/graph-editeur-dialog.component';

@Component({
  selector: 'app-editeur-graphe-nodal',
  templateUrl: './editeur-graphe-nodal.component.html',
  styleUrls: ['./editeur-graphe-nodal.component.less']
})
export class EditeurGrapheNodalComponent implements OnInit {
  echartsInstance ;
  mergeOptions = {};

  _nodes!:  (Event | Trend)[];
  get nodes():  (Event | Trend)[] {
    return this._nodes;
}
@Input() set nodes(value:(Event | Trend)[] ) {
  if (value!=undefined){
    this._nodes = value;
    this.initGraphData();
  }
}

@Output() updateNode = new EventEmitter<(Event | Trend)[]>();


_links!:  Link[];
get links():  Link[] {
  return this._links;
}
@Input() set links(value:Link[] ) {
  if (value!=undefined){
    this._links = value;
    this.initGraphLink();
  }
}

  graphData = []

  graphLink =  []

  initialChartOption: EChartsOption = {
    tooltip: {},
    grid:{
      show:false,
      right:'0',
      bottom:'0',
      top:'0',
      left:'0',
    },
    xAxis: {
      show:false,
      min: 0,
      max: 100,
      type: 'value',
    },
    yAxis: {
      show:false,
      min: 0,
      max: 100,
      type: 'value',
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: []
  };

  @ViewChild('graphScene') graphScene: ElementRef;


  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  initGraphData(){
    this.graphData = new Array(this.nodes.length);

    this.nodes.forEach(node => {

      let draggable = (node.name=='Start')?false:true;
      this.graphData[node.id] = {name:node.name,
        category:node.type,
        draggable: draggable,
        layout: 'none',
        value:[node.x,node.y]
      }
    });

    this.updateChart();
  }

  initGraphLink(){
    this.graphLink = new Array(this.links.length);

    this.links.forEach(link => {
      this.graphLink[link.id] = {
        source:Number(link.source),
        target:Number(link.target),
        lineStyle: {
          color: link.start?"#2E933C":"#DE1A1A",
        }
      }
    });

    this.updateChart();

/*     {
      source: 0,
      target: 1,
      symbolSize: [5, 20],
      label: {
        show: true
      },
      lineStyle: {
        color: 5,
      }
    } */

  }

  onChartInit(ec) {
    this.echartsInstance = ec
  }

  updateNodeCoordinate(offsetX:number,offsetY:number,node:Node){
    //updateNodeCoordonate
    console.log(this.graphScene)
    let width = this.graphScene.nativeElement.clientWidth
    let height = this.graphScene.nativeElement.clientHeight


    let newX = offsetX/width*100;
    let newY = (height-offsetY)/height*100; // passage de coordonnees matricielles à graphiques


    node.x  = newX;
    node.y  = newY;

  }

  onChartClick(event:any): void {




    console.log(event);


      let index = event.dataIndex;
      let elements;
      let graphElements;

      if (!event.data.hasOwnProperty('category')){ // = if data is Link
        elements = this.links;
        graphElements = this.graphLink;
      }
      else {
        elements = this.nodes;
        graphElements = this.graphData;
        // update the coordinate ; if not is reset to start coordinates
        this.updateNodeCoordinate(event.event.offsetX,event.event.offsetY,elements[index])
      }

      let dialogRef;


      if(event.data.category == 'graph')  {
        console.log("open graph dialog");
        let graph = elements[index] as Graph;
        console.log(graph);

        dialogRef = this.dialog.open(GraphEditeurDialogComponent, {data: graph});
      }
      else  dialogRef = this.dialog.open(NodeDialogComponent,{data: [elements[index],this.nodes]});

      dialogRef.afterClosed().subscribe(result => {

        if (result == "delete"){
          elements.splice(index, 1);
          graphElements.splice(index, 1);
        }
        else if (result){
          elements[index] = result;
          if (event.dataType = "edge"){
            graphElements[index].source = Number(result.source);
            graphElements[index].target = Number(result.target);
          }
          else{
            graphElements[index].name = result.name;
          }
        }

        this.updateChart();
        this.updateNode.emit(this.nodes);
      });



  }

  updateChart(){


    let series = [
      {
        type: 'graph',
        layout:'none',
        coordinateSystem:'cartesian2d',
        symbol: 'roundRect',
        symbolSize: [70, 30],
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [10, 10],
        edgeLabel: {
          fontSize: 20
        },
        data: this.graphData,
        links: this.graphLink,
        categories: [{name:'event'},{name:'trend'},{name:'graph'},{name:'start'}],
        lineStyle: {
          opacity: 1,
          width: 1,
          curveness: 0.3
        }
      }
    ]

    this.mergeOptions = {
      series: series
    };


  }












  }


