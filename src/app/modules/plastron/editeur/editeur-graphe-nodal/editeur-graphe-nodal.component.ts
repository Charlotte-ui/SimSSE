import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
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
    console.log(value)
    this.initGraphData();
}

_links!:  Link[];
get links():  Link[] {
  return this._links;
}
@Input() set links(value:Link[] ) {
  this._links = value;
  console.log("links")
  console.log(value)
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
    series: [
      {
        type: 'graph',
        layout: 'force',
       // symbolSize: 10,   
        symbolSize: [20, 1],
        roam: true,
        label: {
          show: true
        },
        symbol: 'roundRect',
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [1, 1],
        edgeLabel: {
          fontSize: 10
        },
        data: this.graphData,
        // links: [],
        links: this.graphLink,
        categories: [{name:'event'},{name:'trend'}],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        },
        force: {
          repulsion: 100
        }
      }
    ]
  };

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  initGraphData(){
    this.graphData = new Array(this.nodes.length);

    this.nodes.forEach(node => {
      console.log(node)
      this.graphData[node.id] = {name:node.name,x:node.x,y:node.y,category:node.type}
    });

    this.updateChart();
  }

  initGraphLink(){
    this.graphLink = new Array(this.links.length);

    this.links.forEach(link => {
      console.log("link")

      console.log(link)
      this.graphLink[link.id] = {source:Number(link.source),target:Number(link.target)}
      console.log(this.graphLink[link.id])
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

      if (event.dataType = "edge"){
        elements = this.links;
        graphElements = this.graphLink;
      }
      else {
        elements = this.nodes;
        graphElements = this.graphData;      
      }

      console.log(event)
  
      const dialogRef = this.dialog.open(NodeDialogComponent, 
        {data: [elements[index],this.nodes]});
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        console.log(result);

        if (result == "delete"){
          elements.splice(index, 1); 
          graphElements.splice(index, 1); 
          console.log(elements)
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
          console.log(this.initialChartOption)
        }
  
        this.updateChart();
      });
    

    
  }

  updateChart(){

    console.log("updateChart")
    console.log(this.graphData)


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


