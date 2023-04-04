import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import { Link, Trend, Event } from 'src/app/modules/core/models/node';
import { TypeVariable, VariablePhysio } from 'src/app/modules/core/models/variablePhysio';
import { NodeDialogComponent } from '../editeur-graphe-nodal/node-dialog/node-dialog.component';
import { TriggerDialogComponent } from './trigger-dialog/trigger-dialog.component';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.less']
})
export class SceneComponent implements OnInit {


  _targetVariable!:  VariablePhysio[];
  get targetVariable():  VariablePhysio[] {
    return this._targetVariable;
}
@Input() set targetVariable(value:VariablePhysio[] ) {
    this._targetVariable = value;
    this.initGraphData();
}

_links!:  Link[];
get links():  Link[] {
  return this._links;
}
@Input() set links(value:Link[] ) {
  this._links = value;
}

_nodes!:  (Event | Trend)[];
get nodes():  (Event | Trend)[] {
  return this._nodes;
}
@Input() set nodes(value:(Event | Trend)[] ) {
  this._nodes = value;
  this.initGraphData();
}

  @Input() duration:number=100;
  @Input() events:number[][]; //  time id


  echartsInstance ;



  variablePhysio = ['SpO2', 'FR']
  graphData = {}

  mergeOptions = {};

  initialChartOption: EChartsOption = {
    tooltip: {trigger: 'axis'},
    legend: {
      data: this.variablePhysio
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'value',
      boundaryGap: false,
      min: 0,
      max: this.duration,
    },
    yAxis: {
      type: 'value'
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: []
  };



  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.updateChart()
  }

  onChartInit(ec) {
    this.echartsInstance = ec
  }

  initGraphData(){

    this.graphData = {
      SpO2: [],
      FR: []
    }

    this.targetVariable.forEach(variable => {
      this.graphData[variable.type]=this.calculCurve(this.duration,variable.cible,variable.rand,variable.type)
    });

    this.updateChart();
  }
  
  calculCurve(size:number,target:number,rand:number,variable:TypeVariable){
    console.log("calculCurve")
    let curve = [];
    let trend = 0; 
    for(let i=0;i<size;i++){
      let event = this.getEventAtTime(i)
      if (event != undefined){
        let nodeTriggers = this.getTrendsFromEvent(event);
        this.nodes.forEach(node => {
          if (node.type == "trend" && (node as Trend).cible == variable ){
            nodeTriggers.forEach(nodeTrigger => {
              if (nodeTrigger[0] == node.id){
                console.log("node is trigger")
                console.log(node)
                if(nodeTrigger[1]) trend = (node as Trend).pente;
                else trend = 0;
                console.log("trend")
                console.log(trend)
              }
            });           
          }      
        });     
      }
      
      let prevValue = target ;
      if (i>0) prevValue = curve[i-1][1]
      console.log("prevValue")
      console.log(prevValue)
      console.log("trend")
      console.log(trend)

      curve.push([i,prevValue + this.gaussianRandom(0,rand) + trend])
    }
    return curve;
  }

  getEventAtTime(time:number):number|undefined{
    console.log("get event at time "+time);
    let result = undefined;
    this.events.forEach(event => {
      if (event[0] == time) result= event[1];
    });
    console.log(result);

    return result;
  }

  getTrendsFromEvent(event:number):any[]{
    console.log("get Trends From Event "+event)
    let trends = [];
    this.links.forEach(link => {
      if(event == link.source) trends.push([link.target,link.start]);
    });
    console.log(trends)
    return trends;
  }


  getNodeByID(id:string):Event | Trend{
    let result = undefined;
    this.nodes.forEach(node => {
      if(node.id == id) result= node;
    });
    return result;
  }


  updateChart(){

    console.log("updateChart")
    console.log(this.graphData['SpO2'])

    let markLineData = []

    this.events.forEach(event => { // time id
      let markline = [];
      let node = this.getNodeByID(event[1].toString())

      markline.push({name:node.name, xAxis: event[0], yAxis: 0})
      markline.push({name:"end", xAxis: event[0], yAxis: 100})

      markLineData.push(markline);

    });



    let series = [
      {
        name: 'SpO2',
        type: 'line',
        stack: 'Total',
        data: this.graphData['SpO2']
      },
      {
        name: 'FR',
        type: 'line',
        stack: 'Total',
        data: this.graphData['FR']
      }
      ,
      {
        name: 'trigger',
        type: 'line',
        stack: 'Total',
        data: [[50,0]],
        markLine: {
          data: markLineData
        }
      },
      
    ]

    this.mergeOptions = {
      series: series
    };
    
    console.log( this.mergeOptions );
   
  }


  onChartClick(event:any): void {

    console.log(event)

    let index = event.dataIndex;
    let elements;
    let graphElements;

    if (event.componentType!= "markLine") return;
     
   
    const dialogRef = this.dialog.open(TriggerDialogComponent, 
      {data: [event]});

    dialogRef.afterClosed().subscribe(result => {

      if (result == "delete"){
        elements.splice(index, 1); 
        graphElements.splice(index, 1); 
      }
      else if (result){
        
      }

      this.updateChart();
    });
  

  
}





  // Standard Normal variate using Box-Muller transform.
  private gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }


}
