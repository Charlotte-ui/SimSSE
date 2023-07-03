import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ECharts, EChartsOption } from 'echarts';
import {
  Trend,
  Event,
  Node,
  Graph,
  NodeType,
  Timer,
  EventType,
} from 'src/app/models/vertex/node';
import { TriggerDialogComponent } from './trigger-dialog/trigger-dialog.component';
import { Modele } from 'src/app/models/vertex/modele';
import { Curve } from 'src/app/functions/curve';
import { Trigger, Timestamp } from 'src/app/models/trigger';
import {
  deleteElementFromArray,
  getNodeByID,
  getElementByChamp,
  isDeepEqual,
  remove,
  isMapDeepEqual,
} from 'src/app/functions/tools';
import { Button, IButton } from 'src/app/functions/display';
import { Edge } from 'src/app/models/vertex/vertex';
import { Timeable } from 'src/app/models/interfaces/timeable';
import { ModeleService } from 'src/app/services/modele.service';
import { ConfirmDeleteDialogComponent } from 'src/app/modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { finalize } from 'rxjs';
import { BioEvent } from 'src/app/models/vertex/event';

var echartsInstance: ECharts;
var scene: SceneComponent;
var updateTrigger;

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.less'],
})
export class SceneComponent implements OnInit {
  Trigger = Trigger;
  Timestamp = Timestamp;

  chartInit = false;
  curveInit = false;

  buttonTrigger: IButton;
  buttonTimeStamp: IButton;

  /**
   * curves data to be display
   */
  series: any[] = [];

  // Inputs
  @Input() duration: number;
  /**
   * all events is the nodes and theirs ids
   */

  @Input() events;
  triggeredEvents: Map<string, Trigger> = new Map<string, Trigger>();
  timeStamps: Map<string, Timestamp> = new Map<string, Timestamp>();
  bioEvents: Map<string, BioEvent> = new Map<string, BioEvent>();

  _modele!: Modele;
  get modele(): Modele {
    return this._modele;
  }
  @Input() set modele(value: Modele) {
    if (value) {
      this._modele = value;
      this.updateChart();
    }
  }

  _curves!: Map<string, Curve>;
  get curves(): Map<string, Curve> {
    return this._curves;
  }
  @Input() set curves(value: Map<string, Curve>) {
    if (value) {
      this._curves = value;
      if (this.legend.length < value.size) this.initLegend(); // if there is new variables to show, changed the legend
    }
  }

  @Input() set draw(value: any[]) {
    console.log('draw ',this.modele);
    this.updateChart();
  }

  @Output() updateTrigger = new EventEmitter<Trigger>();

  // Echart Graph Variables
  legend: any[] = [];
  variableSelected;
  mergeOptions = {};
  markLineData = [];
  markLineY: number = 100; // the max of the curves displayed
  initialChartOption!: EChartsOption;

  constructor(public dialog: MatDialog, public modeleService: ModeleService) {
    scene = this;
    this.buttonTrigger = Button.getButtonByType('trigger');
    this.buttonTimeStamp = Button.getButtonByType('timestamp');
  }

  ngOnInit(): void {}

  onChartInit(ec) {
    echartsInstance = ec;
    /*     echartsInstance.on('finished', () => {
      echartsInstance = ec;
    });  */
  }

  // chart initialisations

  initLegend() {
    this.legend = [];
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
        boundaryGap: [0, 0],
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
      /*      graphic: {
        elements: [
          {
            type: 'group',
            left: 30,
            draggable: 'horizontal',
            ondrag: function (params) {
              var pointInPixel = [params.offsetX, params.offsetY];
              console.log('pointInPixel ', pointInPixel);
              //var pointInGrid = myChart.convertFromPixel('grid', pointInPixel);

              //var xTime = new Date(pointInGrid[0]);

              //get closest value from cursor
              /*  var point = data.reduce((prev, curr) =>
                Math.abs(new Date(curr[0]).valueOf() - xTime.valueOf()) <
                Math.abs(new Date(prev[0]).valueOf() - xTime.valueOf())
                  ? curr
                  : prev
              ); */

      //console.log('poi', new Date(pointInGrid[0]), new Date(point[0]), point[1])
      /* 
              var d = document.getElementById('value2');
              d.style.left = params.offsetX + 'px';
              d.innerHTML = point[1]; 
            },
            onclick: function (params) {
              console.log('clic ', params);
              //var pointInGrid = myChart.convertFromPixel('grid', pointInPixel);

              //var xTime = new Date(pointInGrid[0]);

              //get closest value from cursor
              /*  var point = data.reduce((prev, curr) =>
                Math.abs(new Date(curr[0]).valueOf() - xTime.valueOf()) <
                Math.abs(new Date(prev[0]).valueOf() - xTime.valueOf())
                  ? curr
                  : prev
              ); */

      //console.log('poi', new Date(pointInGrid[0]), new Date(point[0]), point[1])
      /* 
              var d = document.getElementById('value2');
              d.style.left = params.offsetX + 'px';
              d.innerHTML = point[1]; 
            },

            children: [
              {
                id: 'bar1',
                type: 'rect',
                top: '30px',
                shape: {
                  width: 2,
                  height: 685,
                },
                style: {
                  fill: '#ff0000',
                },
                cursor: 'ew-resize',
              },
              {
                type: 'circle',
                top: '74px',
                shape: {
                  r: 10,
                },
                style: {
                  fill: '#ff0000',
                },
              },
              {
                type: 'text',
                z: 100,
                top: 'middle',
                left: 'center',
                style: {
                  text: [
                    '这个文本框的 bounding 为 "raw"',
                    '表示定位时仅仅取 group 自己的',
                    '未经过 transform 的包围盒。',
                  ].join('\n'),
                  font: '20px "STHeiti", sans-serif',
                },
              },
            ],
          },
          {
            type: 'group',
            left: 'center',
            draggable: 'horizontal',
            ondrag: function (params) {
              var pointInPixel = [params.offsetX, params.offsetY];
              console.log('pointInPixel ', pointInPixel);
              //var pointInGrid = myChart.convertFromPixel('grid', pointInPixel);

              //var xTime = new Date(pointInGrid[0]);

              //get closest value from cursor
              /*  var point = data.reduce((prev, curr) =>
                Math.abs(new Date(curr[0]).valueOf() - xTime.valueOf()) <
                Math.abs(new Date(prev[0]).valueOf() - xTime.valueOf())
                  ? curr
                  : prev
              ); */

      //console.log('poi', new Date(pointInGrid[0]), new Date(point[0]), point[1])
      /* 
              var d = document.getElementById('value2');
              d.style.left = params.offsetX + 'px';
              d.innerHTML = point[1]; 
            },

            children: [
              {
                id: 'bar2',
                type: 'rect',
                top: '30px',
                shape: {
                  width: 2,
                  height: 685,
                },
                style: {
                  fill: '#ff0000',
                },
                cursor: 'ew-resize',
              },
              {
                type: 'circle',
                top: '740px',
                shape: {
                  r: 10,
                },
                style: {
                  fill: '#ff0000',
                },
              },
            ],
          },
        ],
      }, */
    };
  }

  // chart updates

  /**
   * check if curves / triggers / timeStamp display need to be update
   * update them if needed
   */
  updateChart() {
    let series: any = Array.from(this.curves).map(([key, curve]) => ({
      name: curve.name,
      type: 'line',
      data: curve.values,
      lineStyle: { color: curve.color },
      itemStyle: { color: curve.color },
    }));

    if (!isDeepEqual(series, this.series)) {
      this.series = series;
      this.mergeOptions = {
        series: this.series,
      };
    }

    if (!isMapDeepEqual(this.modele.triggeredEvents, this.triggeredEvents)) {
      let update = () => {
        if (echartsInstance && !isMapDeepEqual(this.modele.triggeredEvents, this.triggeredEvents)) {
          this.updateTriggerBars();
        } else {
          setTimeout(update, 2000);
        }
      };

      update();
    }

    if (!isMapDeepEqual(this.modele.timeStamps, this.timeStamps)) {
      if (echartsInstance) {
        this.timeStamps = this.modele.timeStamps;
        this.updateTimeStampBars();
      }
    }

    let bioevents = new Map<string, BioEvent>();
    this.modele.graph.nodes.forEach((node: Node, key: string) => {
      if (Node.getType(node) === EventType.bio) {
        let template = (node as Event).template;
        bioevents.set(template.id, template as BioEvent);
      }
    });

     if (!isMapDeepEqual(bioevents, this.bioEvents)) {
      let update = () => {
        if (echartsInstance && echartsInstance['_model'] && bioevents.size !== this.bioEvents.size) {
          this.bioEvents = bioevents;
          this.updateBioBars();
        } else {
          setTimeout(update, 2000);
        }
      };

      update();
    } 
  }

  /**
   * update the graph data of the triggers (markline)
   */
  /*   updateMarklineData() {
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
      let node = getNodeByID(this.modele.graph, trigger.in);
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
  } */

  createBar(
    horizontal: boolean,
    position: number, //trigger.time
    index: string,
    label: string,
    color,
    onDrag: Function,
    onClick: Function
  ) {
    let offset = horizontal
      ? echartsInstance.convertToPixel('grid', [0, position])[1]
      : echartsInstance.convertToPixel('grid', [position, 0])[0];

    return {
      id: index,
      type: 'group',
      $action: 'replace',
      x: horizontal ? 0 : offset,
      y: horizontal ? offset : 0,
      draggable: horizontal ? 'vertical' : 'horizontal', // the drag is on the oppisite direction
      ondrag: function (params) {
        let x = params.target.x;
        let y = params.target.y;
        let pointInGrid = horizontal
          ? echartsInstance.convertFromPixel('grid', [0, y])
          : echartsInstance.convertFromPixel('grid', [x, 0]);
        let newPosition = horizontal
          ? Math.round(pointInGrid[1])
          : Math.round(pointInGrid[0]);
        if (newPosition !== position) {
          onDrag(index, newPosition);
        }
      },
      onclick: function (params) {
        onClick(index);
      },

      children: [
        {
          id: 'bar_' + index,
          z: 100,
          type: 'rect',
          left: horizontal ? '50px' : 'center',
          top: horizontal ? 'center' : '50px',
          shape: horizontal
            ? {
                width: 2000,
                height: 3,
              }
            : {
                width: 3,
                height: 405,
              },
          style: {
            fill: color,
          },
          cursor: 'pointer',
        },
        {
          id: 'label_' + index,
          type: 'text',
          z: 100,
          top: horizontal ? '-15px' : '35px',
          left: horizontal ? '65px' : 'center',
          style: {
            text: label,
            font: '15px, sans-serif',
          },
        },
        {
          type: 'circle',
           id: 'circle_' + index,
          top: horizontal ? 'center' : '445px',
          left: horizontal ? '42px' : '-9px',
          z: 100,
          shape: {
            r: 9,
          },
          style: {
            fill: color,
          },
        },
        {
          type: 'text',
          id: 'time_' + index,
          z: 100,
          top: horizontal ? 'center' : '448.5px',
          left: horizontal ? '43px' : 'center',
          style: {
            text: position,
            font: '8px, sans-serif',
            fill: '#000000',
          },
        },
      ],
    };
  }

  removeTriggerBar(trigger: Trigger | Timestamp) {
    return {
      $action: 'remove',
      id: trigger.id,
      children: [
        {
          id: 'bar_' + trigger.id,

          style: {
            fill: undefined,
          },
        },
      ],
    };
  }

  updateTriggerBar(trigger: Trigger | Timestamp) {
    let left = echartsInstance.convertToPixel('grid', [trigger.time, 0])[0];
    return {
      id: trigger.id,
      x: left,
      children: [
        {
          id: 'time_' + trigger.id,
          style: {
            text: trigger.time,
          },
        },
      ],
    };
  }

  updateTriggerBars() {
    let newTriggers = structuredClone(this.modele.triggeredEvents);

    let triggerBars;

    this.triggeredEvents;

    if (this.triggeredEvents.size < newTriggers.size) {
      let barsToCreate = new Map(
        [...newTriggers].filter(
          ([key, trigger]) => !this.triggeredEvents.get(trigger.id)
        )
      );

      triggerBars = Array.from(barsToCreate).map(([index, trigger]) => {
        let onDrag = function (index: string, newTime: number) {
          let newTrigger = scene.modele.triggeredEvents.get(index);
          newTrigger.time = newTime;
          scene.updateTrigger.emit(newTrigger as Trigger);
          if (trigger.editable)
            scene.modeleService.updateTrigger(newTrigger).subscribe();
        };

        let onClick = function (index) {
          const dialogRef = scene.dialog.open(ConfirmDeleteDialogComponent, {
            data: [
              'Supprimer le trigger ' + trigger.name,
              'Voulez-vous supprimer le trigger ' + trigger.name + ' ?',
            ],
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              if (trigger.editable) {
                scene.modeleService
                  .deleteTrigger(trigger as unknown as Trigger)
                  .subscribe(() => {
                    location.reload();
                    // remove(scene.triggeredEvents,trigger)
                    // list.splice(index, 1);
                    scene.modele.triggeredEvents.delete(trigger.id);
                    scene.updateTrigger.emit(undefined);
                  });
              }
            }
          });
        };

        return this.createBar(
          false,
          trigger.time,
          trigger.id,
          trigger.name,
          trigger.color,
          onDrag,
          onClick
        );
      });

    } else if (this.triggeredEvents.size > newTriggers.size) {

      let barsToDelete = new Map(
        [...this.triggeredEvents].filter(([key, trigger]) =>
          newTriggers.get(trigger.id)
        )
      );


      triggerBars = Array.from(barsToDelete).map(([index, trigger]) => {
        return this.removeTriggerBar(trigger);
      });
    } else {
      let barsToUpdate = new Map(
        [...newTriggers].filter(
          ([key, trigger]) =>
            !isDeepEqual(trigger, this.triggeredEvents.get(trigger.id))
        )
      );

      triggerBars = Array.from(barsToUpdate).map(([index, trigger]) => {
        return this.updateTriggerBar(trigger);
      });
    }

    let graphic = { elements: triggerBars };

/*     let mergeOptions = {

      graphic: graphic,
      
    };  */

     this.mergeOptions = {
        graphic: graphic,
      }; 

    this.triggeredEvents = newTriggers;

    //echartsInstance.setOption(mergeOptions, true);
  }

  updateBioBars() {
    let bioBars = [];
    this.bioEvents.forEach((bioevent, key) => {
      let onDrag = function (index: string, newTime: number) {};

      let onClick = function (index) {};

      bioBars.push(
        this.createBar(
          true,
          bioevent.threshold,
          bioevent.id,
          bioevent.name,
          '#6c757d',
          onDrag,
          onClick
        )
      );
    });

    let graphic = { elements: bioBars };

        this.mergeOptions = {
        graphic: graphic,
      };  
 
/*     let mergeOptions = {
      graphic: graphic,
    }; 

    echartsInstance.setOption(mergeOptions, false,false);  */
  }

  updateTimeStampBars() {
    let timeStampBars;
    this.timeStamps.forEach((timeStamp, index) => {
      let onDrag = function (index: string, newTime: number) {};

      let onClick = function (index) {};

      timeStampBars.push(
        this.createBar(
          false,
          timeStamp.time,
          timeStamp.id,
          timeStamp.name,
          '#6c757d',
          onDrag,
          onClick
        )
      );
    });

    let graphic = { elements: timeStampBars };

    let mergeOptions = {
      graphic: graphic,
    };

    echartsInstance.setOption(mergeOptions, true);
  }

  // event handlers
  /*   onChartClick(event: any): void {
    if (event.componentType != 'markLine') return;

    let clickTrigger = new Trigger(event.data);

    let eventTriggered = this.modele.triggeredEvents.filter(
      (trigger: Trigger) => trigger.time == clickTrigger.xAxis
    )[0];

    clickTrigger.editable = eventTriggered.editable;
    clickTrigger.id = eventTriggered.id;
    clickTrigger.in = eventTriggered.in;
    this.openDialog(clickTrigger, true, true);
  } */

  onChartLegendSelectChanged(event: any): void {
    this.variableSelected = event.selected;
    this.updateChart();
  }

  /**
   * add a new Trigger or Timestamp
   * @param classe
   */
  add(classe: typeof Edge) {
    const dialogRef = this.dialog.open(TriggerDialogComponent, {
      data: [new classe(), this.events, false, classe.className === 'Trigger'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (classe.className === 'Trigger') {
          let newTrigger = result as Trigger;
          newTrigger.name = Node.getName(
            getNodeByID(this.modele.graph, newTrigger.in)
          );

          /* this.modele.triggeredEvents.push(newTrigger);
          this.updateTrigger.emit(newTrigger); */

          this.updateTrigger.emit(newTrigger);
          this.modeleService
            .createTrigger(newTrigger, this.modele)
            .subscribe((res: Trigger) => {
              newTrigger.id = res.id;
              this.modele.triggeredEvents.set(res.id, newTrigger);
              /*   
              this.modele.triggeredEvents[
                this.modele.triggeredEvents.length - 1
              ].id = res.id; */
              location.reload();
            });
        } else {
          let newTimeStamp = result as Timestamp;
          //   this.modele.timeStamps.push(newTimeStamp);
        }
      }
    });
  }
}
