import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import {
  Link,
  Trend,
  Event,
  Node,
  Graph,
  NodeType,
  Timer,
} from 'src/app/models/vertex/node';
import {
  VariablePhysio,
  VariablePhysioInstance,
} from 'src/app/models/vertex/variablePhysio';
import { TriggerDialogComponent } from './trigger-dialog/trigger-dialog.component';
import { Modele } from 'src/app/models/vertex/modele';
import { Curve } from 'src/app/models/curve';
import { Trigger } from 'src/app/models/trigger';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.less'],
})
export class SceneComponent implements OnInit {
  // Inputs
  @Input() duration: number;
  /**
   * all events is the nodes and theirs ids
   */
  //@Input() events: [Event, number, number][];
  @Input() events;
  @Input() modele: Modele;

  _curves!: Curve[];
  get curves(): Curve[] {
    return this._curves;
  }
  @Input() set curves(value: Curve[]) {
    if (value) {
      this._curves = value;
      if (this.legend.length < value.length) this.initLegend(); // if there is new variables to show, changed the legend
      this.initGraphData();
    }
  }

  @Output() updateTrigger = new EventEmitter<Trigger[]>();

  // Echart Graph Variables
  legend: any[] = [];
  variableSelected;
  echartsInstance;
  graphData = {};
  mergeOptions = {};
  markLineData = [];
  markLineY: number = 100; // the max of the curves displayed
  initialChartOption!: EChartsOption;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    //this.intitChartOption()
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  // chart initialisations

  initLegend() {
    this.legend = [
      {
        name: 'trigger',
        itemStyle: { color: '#FEEA00' },
        lineStyle: { color: '#FEEA00' },
      },
    ];
    this.variableSelected = {}; 

    this.curves.forEach((curve) => {
      this.legend.push(curve.name);
      this.variableSelected[curve.name] = true; // at init, all the variables are selected
    });
    this.intitChartOption();
  }

  intitChartOption() {
    this.initialChartOption = {
      tooltip: { trigger: 'axis' },
      legend: {
        data: this.legend,
      },
      grid: {
        show: false,
        right: '50',
        bottom: '50',
        top: '50',
        left: '50',
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
        type: 'value',
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [],
    };
  }

  initGraphData() {
    this.graphData = {};
    this.curves.forEach((curve) => {
      this.graphData[curve.name] = curve.values;
    });
    this.updateMarklineData();
    this.updateChart();
  }

  // chart updates

  /**
   * update the graph data of the triggers (markline)
   */
  updateMarklineData() {
    // on détermine la hauteur de la markline en fct de la taille des courbes
    this.markLineY = 0;
    this.curves.forEach((curve) => {
      if (
        this.variableSelected[curve.name] &&
        curve.currentMax > this.markLineY
      )
        this.markLineY = curve.currentMax;
    });

    this.markLineData = [];

    this.modele.triggeredEvents.map((event: Trigger) => {
      // time id
      let markline = [];
      let node = this.getNodeByID(event.id);
      if (node) {
        // si le node est présent sur le graph
        let name;

        switch (node.type) {
          case NodeType.event:
            name = (node as Event).template
              ? (node as Event).template.name
              : (node as Event).typeEvent;
            break;
          case NodeType.timer:
            name = 'Fin ' + (node as Timer).name;
            break;
          default:
            name = (node as Trend | Graph).name;
        }

        let color = 'event' in node ? '#FEEA00' : '#C8FFBE';

        markline.push({
          name: name,
          xAxis: event.time,
          yAxis: 0,
          lineStyle: { color: color },
        });
        markline.push({
          name: 'end',
          xAxis: event.time,
          yAxis: this.markLineY,
          lineStyle: { color: color },
        });

        this.markLineData.push(markline);
      }
    });

    this.modele.timeStamps.map((timeStamp: number) => {
      let markline = [];
      markline.push({
        name: '',
        xAxis: timeStamp,
        yAxis: 0,
        lineStyle: { color: '#6c757d' },
      });
      markline.push({
        name: 'end',
        xAxis: timeStamp,
        yAxis: this.markLineY,
        lineStyle: { color: '#6c757d' },
      });

      this.markLineData.push(markline);
    });
  }

  updateChart() {
    let series:any[] = this.curves.map(curve => (
      {
        name: curve.name,
        type: 'line',
        data: this.graphData[curve.name],
        lineStyle: { color: curve.color },
        itemStyle: { color: curve.color },
      }
    ));

    // add triggers (markline)
    series.push({
      name: 'trigger',
      type: 'line',
      //  stack: 'x',
      data: [[50, 0]],
      markLine: {
        data: this.markLineData,
      },
    });

    // add timeStamp (markline)
/*     series.push({
      name: 'timeStamp',
      type: 'line',
      //  stack: 'x',
      data: [[50, 0]],
      markLine: {
        data: this.markLineData,
      },
    }); */

    this.mergeOptions = {
      series: series,
    };
  }

  // event handlers
  onChartClick(event: any): void {
    let index = event.dataIndex;
    let elements;
    let graphElements;

    if (event.componentType != 'markLine') return;

    let trigger = event.data;
    let eventTriggered = this.getTriggerAtTime(trigger.xAxis);
    trigger['editable'] = eventTriggered.editable;
    trigger['id'] = eventTriggered.id;
    this.openTriggerDialog(event.data, true, true);
  }

  onChartLegendSelectChanged(event: any): void {
    this.variableSelected = event.selected;
    this.updateMarklineData();
    this.updateChart();
  }

  addTrigger() {
    this.openTriggerDialog(new Trigger(), false, true);
  }

  addTimeStamp() {
    let newTimeSTamp = {
      name: '',
      xAxis: 0,
      yAxis: 0,
      coord: [0, 0],
      type: null,
      id: '',
    };

    this.openTriggerDialog(newTimeSTamp, false, false);
  }

  /**
   * open the trigger dialog
   * @param trigger
   * @param edition
   */
  openTriggerDialog(trigger, edition: boolean, isTrigger: boolean) {
    const dialogRef = this.dialog.open(TriggerDialogComponent, {
      data: [trigger, this.events, edition, isTrigger],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
      if (isTrigger) {
        let event = this.getTriggerAtTime(result.coord);
        if (result.delete) {
          const index = this.modele.triggeredEvents.indexOf(event);
          if (index > -1) this.modele.triggeredEvents.splice(index, 1);
        } else if (result) {
          // update the time of the trigger
          if (edition)
            event.time = Number(result.xAxis);
          else {
            let event = new Trigger({
              time: Number(result.xAxis),
              id: result.event,
            });
            this.modele.triggeredEvents.push(event);
          }
          this.updateTrigger.emit(this.modele.triggeredEvents);
        }
      } else {
        if (result.delete) {
          let index = this.modele.timeStamps.indexOf(result.coord);
          if (index > -1) this.modele.timeStamps.splice(index, 1);
        } else if (result) {
          if (edition) {
            let index = this.modele.timeStamps.indexOf(result.coord);
            if (index > -1)
              this.modele.timeStamps[index] = Number(result.xAxis);
          } else {
            this.modele.timeStamps.push(result.xAxis);
          }
        }
      }
      this.initGraphData();
    }
    });
  
  }

  // tools

  private getTriggerAtTime(time: number): Trigger | undefined {
    let result = undefined;
    this.modele.triggeredEvents.forEach((trigger) => {
      if (trigger.time == time) result = trigger;
    });
    return result;
  }

  private getNodeByID(id: string): Node {
    let result = undefined;
    this.modele.graph.nodes.forEach((node) => {
      // event are identified by evnt

      if (node.type == NodeType.event && (node as Event).event == id)
        result = node;
      else if (node.id == id) result = node;
    });
    return result;
  }
}
