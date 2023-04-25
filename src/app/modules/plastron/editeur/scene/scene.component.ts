import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import { Link, Trend, Event,Node, Graph, NodeType, Timer } from 'src/app/modules/core/models/node';
import {  VariablePhysio, VariablePhysioInstance } from 'src/app/modules/core/models/variablePhysio';
import { TriggerDialogComponent } from './trigger-dialog/trigger-dialog.component';
import { Modele } from 'src/app/modules/core/models/modele';

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
      console.log("Input curves")
      console.log(value)

      this._curves = value;
      if(this.legend.length < value.length) this.initLegend() ; // if there is new variables to show, changed the legend
      this.initGraphData();
    }
  }

  @Input()  modele:Modele;


  @Output() updateTrigger = new EventEmitter<[number,string][]>();


  // Echart Graph Variables
  legend:any[] =[];
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
    this.legend = [{name:'trigger',itemStyle:{color:"#FEEA00"},lineStyle:{color:"#FEEA00"}}];
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

    // on détermine la hauteur de la markline en fct de la taille des courbes
    this.markLineY = 0;
    this.curves.forEach(curve => {
      if (this.variableSelected[curve.nom] && curve.currentMax>this.markLineY) this.markLineY = curve.currentMax;
    });

    this.markLineData = []

    this.modele.triggeredEvents.forEach(event => { // time id
      let markline = [];

      let node = this.getNodeByID(event[1].toString()) // TODO get the getName() to work

      let name = ("event" in node)?(node as Event).event : "Fin "+(node as Timer).name



      markline.push({
        name:name,
        xAxis: event[0],
        yAxis: 0,
        lineStyle :{color:"#FEEA00"}
      })
      markline.push(
        {name:"end",
        xAxis: event[0],
        yAxis: this.markLineY,
        lineStyle :{color:"#FEEA00"}
      })

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
    let index = event.dataIndex;
    let elements;
    let graphElements;

    if (event.componentType!= "markLine") return;

    let trigger = event.data;
    trigger["eventId"] = this.getEventAtTime(trigger.xAxis)[1];

    this.openTriggerDialog(event.data,true);


  }

  onChartLegendSelectChanged(event:any): void {
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
      event:'',
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

        const index = this.modele.triggeredEvents.indexOf(event);
        if (index > -1) this.modele.triggeredEvents.splice(index, 1);

      }
      else if (result){

        console.log("add trigger")


        console.log(result)

        // update the time of the trigger
        if (edition) this.getEventAtTime(result.coord)[0] = Number(result.xAxis) ;

        else {
          let event = [Number(result.xAxis),result.event] as [number,string]
          this.modele.triggeredEvents.push(event);
        }

        this.updateTrigger.emit(this.modele.triggeredEvents);

      }
      this.initGraphData();
    });
  }

  // tools

  private getEventAtTime(time:number):[number,string]|undefined{
    let result = undefined;
    this.modele.triggeredEvents.forEach(event => {
      if (event[0] == time) result= event;
    });
    return result;
  }


  private getNodeByID(id:string):Node{
    let result = undefined;
    this.modele.graph.nodes.forEach(node => {
      // event are identified by name
      if (node.type == NodeType.event && (node as Event).event == id ) result= node;
      else if(node.id == id) result= node;
    });
    return result;
  }
}
