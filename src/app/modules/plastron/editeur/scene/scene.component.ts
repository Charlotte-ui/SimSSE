import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import { Link, Trend, Event } from 'src/app/modules/core/models/node';
import {  VariablePhysio } from 'src/app/modules/core/models/variablePhysio';
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
    console.log("set targetVariable");
    console.log(value);
    if (this.nodes) this.initGraphData();
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
 // console.log("set nodes in scene")
 // console.log(value)

 if (value){ // if value isnt undefined
  this._nodes = value;

  this.events=[];

  this.nodes.forEach((node,i) => {
    // if the node is an event
    if ('event' in node) this.events.push([node,i]);

  });

  console.log("events")
  console.log(this.events)

  this.initGraphData();

 }


}

@Input() duration:number=100;
@Input() triggeredEvents:number[][]; //  time id

  /**
   * all events is the nodes and theirs ids
   */
  events:(Event|number)[][];



  variablePhysio = ['SpO2', 'FR','RC','HemoCue','Temp','PAD','PAS','trigger']


  // Echart Graph Variables
  echartsInstance ;
  graphData = {};
  mergeOptions = {};
  markLineData = [];
  markLineY = 100 ; // size of the makLine, = the biggest curve value

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
    //this.updateChart()
  }

  onChartInit(ec) {
    this.echartsInstance = ec
  }

  initGraphData(){

    if (this.targetVariable && this.nodes && this.links){
      this.graphData = {
        SpO2: [],
        FR: [],
        RC: [],
        HemoCue: [],
        Temp: [],
        PAD: [],
        PAS: [],
      }

      this.targetVariable.forEach(variable => {
        this.graphData[variable.nom]=this.calculCurve(this.duration,variable.cible,variable.rand,variable.nom)
      });

      this.updateMarklineData()

      this.updateChart();

    }


  }

  /**
   * generate the data
   * @param size
   * @param target
   * @param rand
   * @param variable
   * @returns
   */
  calculCurve(size:number,target:number,rand:number,variable:string){
    let curve = [];
    let trend = 0;
    this.markLineY = 100;
    for(let i=0;i<size;i++){
      let event = this.getEventAtTime(i)
      if (event != undefined){
        let nodeTriggers = this.getTrendsFromEvent(event[1]);
        this.nodes.forEach(node => {
          if (node.type == "trend" && (node as Trend).cible == variable ){
            nodeTriggers.forEach(nodeTrigger => {
              if (nodeTrigger[0] == node.id){
            //    console.log("node is trigger")
            //    console.log(node)
                if(nodeTrigger[1]) trend = (node as Trend).pente;
                else trend = 0;
             //   console.log("trend")
            //    console.log(trend)
              }
            });
          }
        });
      }

      let prevValue = target ;
      if (i>0) prevValue = curve[i-1][1]
/*       console.log("prevValue")
      console.log(prevValue)
      console.log("trend")
      console.log(trend) */

      // update the size of the markline
      if (this.markLineY<prevValue) this.markLineY = prevValue; // TODO change because data doesnt change when curve disapeared

      curve.push([i,prevValue + this.gaussianRandom(0,rand) + trend])
    }
    return curve;
  }

  getEventAtTime(time:number):number[]|undefined{
  //  console.log("get event at time "+time);
    let result = undefined;
    this.triggeredEvents.forEach(event => {
      if (event[0] == time) result= event;
    });
 //   console.log(result);

    return result;
  }

  getTrendsFromEvent(event:number):any[]{
  //  console.log("get Trends From Event "+event)
    let trends = [];
    this.links.forEach(link => {
      if(event == link.source) trends.push([link.target,link.start]);
    });
  //  console.log(trends)
    return trends;
  }


  getNodeByID(id:string):Event | Trend{
    let result = undefined;
    this.nodes.forEach(node => {
      if(node.id == id) result= node;
    });
    return result;
  }


  /**
   * update the graph data of the triggers (markline)
   */
  updateMarklineData(){

    this.markLineData = []

    this.triggeredEvents.forEach(event => { // time id
      let markline = [];
      let node = this.getNodeByID(event[1].toString())

      markline.push({name:node.name, xAxis: event[0], yAxis: 0})
      markline.push({name:"end", xAxis: event[0], yAxis: this.markLineY})

      this.markLineData.push(markline);

    });

  }


  updateChart(){

    let series = []

    this.targetVariable.forEach(variable => {
      let serie = {
        name:variable.nom,
        type:'line',
   //     stack: 'x',
        data: this.graphData[variable.nom]
      }
      series.push(serie);

    });


    // add triggers (markline)
    series.push({
      name: 'trigger',
      type: 'line',
    //  stack: 'x',
      data: [[50,0]],
      markLine: {
        data: this.markLineData
      }
    })

    this.mergeOptions = {
      series: series
    };


  }


  onChartClick(event:any): void {

    console.log(event)

    let index = event.dataIndex;
    let elements;
    let graphElements;

    if (event.componentType!= "markLine") return;

    console.log(event.data)

    let trigger = event.data;
    trigger["eventId"] = this.getEventAtTime(trigger.xAxis)[1];

    this.openTriggerDialog(event.data,true);


  }

  addTrigger(){

    console.log("addTrigger")

    let newTrigger = {
      name:"",
      xAxis: 0,
      yAxis: 0,
      coord: [ 0, 0 ],
      type: null,
      eventId:0,
    }

    this.openTriggerDialog(newTrigger,false);





  }

  /**
   * open the trigger dialog
   * @param trigger
   * @param edition
   */
  openTriggerDialog(trigger,edition:boolean){

    const dialogRef = this.dialog.open(TriggerDialogComponent,
      {data: [trigger,this.events,edition]});

    dialogRef.afterClosed().subscribe(result => {

      if (result == "delete"){
        let event = this.getEventAtTime(result.coord);

        const index = this.triggeredEvents.indexOf(event);
        if (index > -1) this.triggeredEvents.splice(index, 1);

      }
      if (result == "add"){
      }
      else if (result){

        console.log(result)

        // update the time of the trigger
        if (edition) this.getEventAtTime(result.coord)[0] = Number(result.xAxis) ;

        else {
          let event = [Number(result.xAxis),result.eventId]
          this.triggeredEvents.push(event);
        }
      }
      this.initGraphData();
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
