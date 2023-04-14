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

  // Inputs

  _targetVariable!:  VariablePhysio[];
  get targetVariable():  VariablePhysio[] {
    return this._targetVariable;
  }
  @Input() set targetVariable(value:VariablePhysio[] ) {
    if (value){ // if value isnt undefined
      this._targetVariable = value;
      console.log("set targetVariable");
      console.log(value);
      if(this.legend.length < value.length) this.initLegend() ; // if there is new variables to show, changed the legend
      if (this.nodes) this.initGraphData();
    }
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
    if (value){ // if value isnt undefined
      this._nodes = value;
      this.events=[];
      this.nodes.forEach((node,i) => {
        if ('event' in node) this.events.push([node,i]); // if the node is an event
      });
      this.initGraphData();
    }
  }

  @Input() duration:number=100;
  @Input() triggeredEvents:number[][]; //  time id



  /**
   * all events is the nodes and theirs ids
   */
  events:(Event|number)[][];


  // Echart Graph Variables
  legend:string[] =[];
  echartsInstance ;
  graphData = {};
  mergeOptions = {};
  markLineData = [];
  markLineY:number = 100; // the max of the curves displayed
  initialChartOption!: EChartsOption ;



  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    //this.intitChartOption()
  }

  onChartInit(ec) {
    this.echartsInstance = ec
  }


  // chart initialisations

  initLegend(){
    this.legend = ['trigger'];
    this.targetVariable.forEach(variable => {
      this.legend.push(variable.nom)
      variable["currentMax"] = 0 // the maximum value of the curve, used to set the height of the triggers
    });
    this.intitChartOption();
  }

  intitChartOption(){
    this.initialChartOption = {
      tooltip: {trigger: 'axis'},
      legend: {
        data: this.legend
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
  }

  initGraphData(){
    if (this.targetVariable && this.nodes && this.links){
      let variableSelected = {} // at init, all the variables are selected
      this.graphData = {}
      this.targetVariable.forEach(variable => {
        this.graphData[variable.nom]=this.calculCurve(this.duration,variable)
        variableSelected[variable.nom] = true;
      });
      this.updateMarklineData(variableSelected)
      this.updateChart();
    }
  }

  // chart updates

  /**
   * update the graph data of the triggers (markline)
   */
  updateMarklineData(selected){

    this.markLineY = 0;
    this.targetVariable.forEach(variable => {
      if (selected[variable.nom] && variable["currentMax"]>this.markLineY) this.markLineY = variable["currentMax"];
    });

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

  // event handlers
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

  onChartLegendSelectChanged(event:any): void {
    console.log(event);


    this.updateMarklineData(event.selected);
    this.updateChart();

  }

  addTrigger(){
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

  // tools

  /**
   * generate the data
   * @param size
   * @param variable
   * @returns
   */
  private calculCurve(size:number,variable:VariablePhysio){
    let curve = [];
    let trend = 0;
    variable["currentMax"] = 0;
    let prevValue = variable.cible ;
    for(let i=0;i<size;i++){
      let event = this.getEventAtTime(i)
      if (event != undefined){
        let nodeTriggers = this.getTrendsFromEvent(event[1]);
        this.nodes.forEach(node => {
          if (node.type == "trend" && (node as Trend).cible == variable.nom ){
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

      if (i>0) prevValue = curve[i-1][1]

      let newValue = prevValue + this.gaussianRandom(0,variable.rand) + trend;
      if (newValue>variable.max) newValue = variable.max;
      if (newValue<variable.min) newValue = variable.min;
      if (variable["currentMax"]<newValue) variable["currentMax"] = newValue;

      curve.push([i,newValue])
    }
    return curve;
  }

  private getEventAtTime(time:number):number[]|undefined{
    let result = undefined;
    this.triggeredEvents.forEach(event => {
      if (event[0] == time) result= event;
    });
    return result;
  }

  private getTrendsFromEvent(event:number):any[]{
    let trends = [];
    this.links.forEach(link => {
      if(event == link.source) trends.push([link.target,link.start]);
    });
    return trends;
  }

  private getNodeByID(id:string):Event | Trend{
    let result = undefined;
    this.nodes.forEach(node => {
      if(node.id == id) result= node;
    });
    return result;
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
