import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import {
  Trend,
  Event,
  Node,
  Graph,
  NodeType,
  Timer,
} from 'src/app/models/vertex/node';
import { TriggerDialogComponent } from './trigger-dialog/trigger-dialog.component';
import { Modele } from 'src/app/models/vertex/modele';
import { Curve } from 'src/app/functions/curve';
import { Trigger, Timestamp } from 'src/app/models/trigger';
import { deleteElementFromArray, getNodeByID, getElementByChamp } from 'src/app/functions/tools';
import { Button } from 'src/app/functions/display';
import { Edge } from 'src/app/models/vertex/vertex';
import { Timeable } from 'src/app/models/interfaces/timeable';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.less'],
})
export class SceneComponent implements OnInit {
  Trigger = Trigger;
  Timestamp = Timestamp;

  button: Button = new Button();

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

  @Output() updateTrigger = new EventEmitter<Trigger>();
  @Output() deleteTrigger = new EventEmitter<Trigger>();

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
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
    console.log(ec)
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
      if (curve.name) {
          this.legend.push(curve.name);
          this.variableSelected[curve.name] = true; // at init, all the variables are selected
      }
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
    this.modele.triggeredEvents.map((trigger: Trigger) => {
      // time id
      let markline = [];
      let node = getNodeByID(this.modele.graph,trigger.in);
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

        // TODO replace by ref
        let color = 'event' in node ? '#FEEA00' : '#C8FFBE';

        markline.push({
          name: name,
          xAxis: trigger.time,
          yAxis: 0,
          lineStyle: { color: color },
        });
        markline.push({
          name: 'end',
          xAxis: trigger.time,
          yAxis: this.markLineY,
          lineStyle: { color: color },
        });

        this.markLineData.push(markline);
      }
    });

    this.modele.timeStamps.map((timeStamp: Timestamp) => {
      let markline = [];
      markline.push({
        name: timeStamp.name,
        xAxis: timeStamp.time,
        yAxis: 0,
        lineStyle: { color: '#6c757d' },
      });
      markline.push({
        name: 'end',
        xAxis: timeStamp.time,
        yAxis: this.markLineY,
        lineStyle: { color: '#6c757d' },
      });

      this.markLineData.push(markline);
    });
  }

  updateChart() {

    this.updateMarklineData();

    let series: any[] = this.curves.map((curve) => ({
      name: curve.name,
      type: 'line',
      data: this.graphData[curve.name],
      lineStyle: { color: curve.color },
      itemStyle: { color: curve.color },
    }));

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
    if (event.componentType != 'markLine') return;

    let clickTrigger = new Trigger(event.data);

    let eventTriggered = this.modele.triggeredEvents.filter(
      (trigger: Trigger) => trigger.time == clickTrigger.xAxis
    )[0];

    clickTrigger.editable = eventTriggered.editable;
    clickTrigger.id = eventTriggered.id;
    clickTrigger.in = eventTriggered.in;
    this.openDialog(clickTrigger, true, true);
  }

  onChartLegendSelectChanged(event: any): void {
    this.variableSelected = event.selected;
    this.updateChart();
  }

  add(classe: typeof Edge) {
    this.openDialog(new classe(), false, classe.className === 'Trigger');
  }

  /**
   * open the trigger dialog
   * @param trigger
   * @param edition
   */
  openDialog(trigger, edition: boolean, isTrigger: boolean) {
    const dialogRef = this.dialog.open(TriggerDialogComponent, {
      data: [trigger, this.events, edition, isTrigger],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (isTrigger) {
          this.change<Trigger>(Trigger,result, edition);
        } else {
          this.change<Timestamp>(Timestamp,result, edition);
          console.log("this.modele.timeStamps ",this.modele.timeStamps)
        }
        this.initGraphData();
      }
    });
  }

  change<T extends Timeable>(classe: typeof Edge, result, edition) {
    let element:T;
    let list :T[]= ((classe.className === 'Trigger')?this.modele.triggeredEvents:this.modele.timeStamps) as unknown as T[];
    if (result.delete) {
      result = getElementByChamp<T>(list,'id',result.id)
      deleteElementFromArray(list, element);
      if(classe.className === 'Trigger') this.deleteTrigger.emit(element as unknown  as Trigger);
    } else if (result) {
      if (edition) {
        // update the time of the trigger
        element = getElementByChamp<T>(list,'time',result.coord)
        element.time = Number(result.xAxis);
      } else {
        // add the trigger
        result.time = Number(result.xAxis)
        element = new classe(result) as unknown as T ;        
        list.push(element);
      }
      if(classe.className === 'Trigger') this.deleteTrigger.emit(element as unknown as Trigger);
    }
  }

  changeTimeStamp(result, edition) {
    let timestamp;
    if (result.delete) {
      timestamp = getElementByChamp<Timestamp>(this.modele.timeStamps,'id',result.id)
      deleteElementFromArray(this.modele.timeStamps, result);
    } else if (result) {
      if (edition) {
        timestamp = getElementByChamp<Timestamp>(this.modele.timeStamps,'time',result.coord)
        timestamp.time = Number(result.xAxis);
      } else {
        this.modele.timeStamps.push(timestamp);
      }
    }
  }

}
