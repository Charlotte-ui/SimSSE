import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import { Link, Trend, Event,Node } from 'src/app/modules/core/models/node';
import {  VariablePhysio, VariablePhysioInstance } from 'src/app/modules/core/models/variablePhysio';
import { TriggerDialogComponent } from './trigger-dialog/trigger-dialog.component';

export interface Curve{
  nom:string,
  values: number [][], // x,y
  currentMax:number,
}

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.less']
})



export class SceneComponent implements OnInit {

  // Inputs
  @Input() duration:number;
  @Input() nodes:Node[];
  @Input() triggeredEvents:number[][]; //  time id
    /**
   * all events is the nodes and theirs ids
   */
    @Input() events:[Event,number,number][];

  _curves!:  Curve[];
  get curves():  Curve[] {
    return this._curves;
  }
  @Input() set curves(value:Curve[] ) {
    if (value){ // if value isnt undefined
      this._curves = value;
      console.log("set curves");
      console.log(value);
      if(this.legend.length < value.length) this.initLegend() ; // if there is new variables to show, changed the legend
      this.initGraphData();
    }
  }

  @Output() updateTrigger = new EventEmitter<number[][]>();






  // Echart Graph Variables
  legend:string[] =[];
  variableSelected;
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
    this.variableSelected = {} // at init, all the variables are selected

    this.curves.forEach(curve => {
      this.legend.push(curve.nom)
      this.variableSelected[curve.nom] = true;

     // curve.currentMax = 0 // the maximum value of the curve, used to set the height of the triggers
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
        /* axisLabel: {
          formatter: '{value} cm'
        }, */
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
    this.graphData = {}
    this.curves.forEach(curve => {
      this.graphData[curve.nom]=curve.values;
    });
    this.updateMarklineData()
    this.updateChart();
  }

  // chart updates

  /**
   * update the graph data of the triggers (markline)
   */
  updateMarklineData(){
    this.markLineY = 0;
    this.curves.forEach(curve => {
      if (this.variableSelected[curve.nom] && curve.currentMax>this.markLineY) this.markLineY = curve.currentMax;
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

    this.curves.forEach(curve => {
      let serie = {
        name:curve.nom,
        type:'line',
   //     stack: 'x',
        data: this.graphData[curve.nom]
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
    this.variableSelected = event.selected;
    this.updateMarklineData();
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
      else if (result){

        console.log(result)

        // update the time of the trigger
        if (edition) this.getEventAtTime(result.coord)[0] = Number(result.xAxis) ;

        else {
          let event = [Number(result.xAxis),result.eventId]
          this.triggeredEvents.push(event);
         //
        }

        this.updateTrigger.emit(this.triggeredEvents);

      }
      this.initGraphData();
    });
  }

  // tools

  private getEventAtTime(time:number):number[]|undefined{
    let result = undefined;
    this.triggeredEvents.forEach(event => {
      if (event[0] == time) result= event;
    });
    return result;
  }


  private getNodeByID(id:string):Event | Trend{
    let result = undefined;
    this.nodes.forEach(node => {
      if(node.id == id) result= node;
    });
    return result;
  }



}
