import { Component, OnInit, Inject, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption, util } from 'echarts';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { Trend,Event, Link, Graph ,Node} from 'src/app/modules/core/models/node';
import * as echarts from 'echarts/types/dist/echarts';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';
import { GraphEditeurDialogComponent } from './graph-editeur-dialog/graph-editeur-dialog.component';
import { NodeType } from 'src/app/modules/core/models/node';
import { EventType } from 'src/app/modules/core/models/node';

@Component({
  selector: 'app-editeur-graphe-nodal',
  templateUrl: './editeur-graphe-nodal.component.html',
  styleUrls: ['./editeur-graphe-nodal.component.less']
})
export class EditeurGrapheNodalComponent implements OnInit {
  echartsInstance ;
  mergeOptions = {};

  _graph!:  Graph;
  get graph():  Graph {
    return this._graph;
}
@Input() set graph(value:Graph ) {
  if (value!=undefined){
    this._graph = value;
    this.initGraphLink();
    this.initGraphData();
    this.updateChart();
  }
}

@Output() updateNode = new EventEmitter<Node[]>();
@Output() updateLink = new EventEmitter<Link[]>();


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

  //initialisateurs

  initGraphData(){
    this.graphData = new Array(this.graph.nodes.length);

    this.graph.nodes.forEach(node => {
      let draggable = (node.type == NodeType.event && (node as Event).typeEvent == EventType.start)?false:true;
      let cat:string = node.type;
      cat+= (node.type == NodeType.event )?(node as Event).typeEvent:"";
      console.log(node)

      console.log(node.type)
      console.log(cat)

      this.graphData[node.id] = {name:node.name,
        category:cat,
        draggable: draggable,
        layout: 'none',
        value:[node.x,node.y]
      }
    });

  }

  initGraphLink(){
    this.graphLink = new Array(this.graph.links.length);

    this.graph.links.forEach(link => {
      this.graphLink[link.id] = {
        source:Number(link.source),
        target:Number(link.target),
        lineStyle: {
          color: link.start?"#2E933C":"#DE1A1A",
        }
      }
    });



  }


  //updateurs

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
        categories: [{
          name:'eventbio',
          itemStyle:{color:"#FC9E4F"}
        },{
          name:'eventaction',
          itemStyle:{color:"#73bfb8"}
        },{
          name:'eventstart',
          symbol:'rect',
          itemStyle:{color:"#FFFFFF",borderColor:"#000000",borderWidth:1}
        },{
          name:'trend',
          itemStyle:{color:"#F2F3AE"}
        },{
          name:'graph',
          itemStyle:{color:"#F0D3F7"}
        }],
        lineStyle: {
          opacity: 1,
          width: 1,
          curveness: 0.3
        }
      }
    ]
    console.log("series")

    console.log(series)

    this.mergeOptions = {
      series: series
    };


  }

  updateNodeCoordinate(offsetX:number,offsetY:number,node:Node){
    let width = this.graphScene.nativeElement.clientWidth
    let height = this.graphScene.nativeElement.clientHeight
    let newX = offsetX/width*100;
    let newY = (height-offsetY)/height*100; // passage de coordonnees matricielles à graphiques
    node.x  = newX;
    node.y  = newY;
  }

  //event handlers

  onChartInit(ec) {
    this.echartsInstance = ec
  }

  onChartClick(event:any): void {
    if (event.dataType == "node") return this.onNodeClick(event);
    if (event.dataType == "edge") return this.onEdgeClick(event);
  }

  onNodeClick(event:any){
    console.log("onNodeClick")
    console.log(event)

    let index = event.dataIndex;
    let node = this.graph.nodes[index];

    // update the coordinate ; if not is reset to start coordinates
    this.updateNodeCoordinate(event.event.offsetX,event.event.offsetY,node)

    let dialogRef;

    if(event.data.category == 'graph')  {
      let graph = node as Graph;
      dialogRef = this.dialog.open(GraphEditeurDialogComponent, {data: graph});
    }
    else  dialogRef = this.dialog.open(NodeDialogComponent,{data: [node,this.graph.nodes,"Modifier"]});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if (result == "delete"){
          this.graph.nodes.splice(index, 1);
          this.graphData.splice(index, 1);
        }
        else  {
          result.x = node.x;
          result.y = node.y;
          this.graph.nodes[index] = result;
          this.graphData[index].name = result.name;
        }

        this.updateChart();
        this.updateNode.emit([result,index]);
      }


    });

  }

  onEdgeClick(event:any){
    let index = event.dataIndex;
    let link = this.graph.links[index];
    let dialogRef = this.dialog.open(NodeDialogComponent,{data: [link,this.graph.nodes,"Modifier"]});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if (result == "delete"){
          this.graph.links.splice(index, 1);
          this.graphLink.splice(index, 1);
        }
        else  {
          this.graph.links[index] = result;
          this.graphLink[index]= {
            source:Number(result.source),
            target:Number(result.target),
            lineStyle: {
              color: result.start?"#2E933C":"#DE1A1A",
            }
            //TODO debbug color
          }
          console.log("this.graphLink[index]");
          console.log(this.graph.links[index]);

          console.log(this.graphLink[index]);
        }
        this.updateChart();
        this.updateLink.emit([result,index]);
      }
    });
  }














  }


