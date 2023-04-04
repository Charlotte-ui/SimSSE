import { Component, OnInit, Inject, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption, util } from 'echarts';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { Trend,Event, Link } from 'src/app/modules/core/models/node';
import * as echarts from 'echarts/types/dist/echarts';

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
    this._nodes = value;
    this.initGraphData();
}

@Output() newNodes = new EventEmitter<(Event | Trend)[]>();


_links!:  Link[];
get links():  Link[] {
  return this._links;
}
@Input() set links(value:Link[] ) {
  this._links = value;
  this.initGraphLink();
}

  graphData = []

  graphLink =  []

  initialChartOption: EChartsOption = {
    title: {
      text: 'Basic Graph'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: []
  };

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  initGraphData(){
    this.graphData = new Array(this.nodes.length);

    this.nodes.forEach(node => {
      this.graphData[node.id] = {name:node.name,x:node.x,y:node.y,category:node.type}
    });

    this.updateChart();
  }

  initGraphLink(){
    this.graphLink = new Array(this.links.length);

    this.links.forEach(link => {
      this.graphLink[link.id] = {source:Number(link.source),target:Number(link.target)}
    });

    this.updateChart();
  }

  onChartInit(ec) {
    this.echartsInstance = ec
  }

  onChartClick(event:any): void {

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
      }
      
      const dialogRef = this.dialog.open(NodeDialogComponent, 
        {data: [elements[index],this.nodes]});
  
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
        this.newNodes.emit(this.nodes);
      });
    

    
  }

  updateChart(){


    let series = [
      {
        type: 'graph',
        layout: 'force',
        draggable: true,
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
        // links: [],
        links: this.graphLink,
        categories: [{name:'event'},{name:'trend'}],
        lineStyle: {
          opacity: 1,
          width: 1,
          curveness: 0.3
        },
        force: {
          repulsion: 100,
          gravity: 0.1,
          edgeLength: 100,
          friction: 0.015,
          layoutAnimation: true
        }
      }
    ]

    this.mergeOptions = {
      series: series
    };

   
  }

  










  }


