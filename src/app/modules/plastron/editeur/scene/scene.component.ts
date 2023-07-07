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
  colorContrast,
  differenceMaps,
} from 'src/app/functions/tools';
import { Button, IButton } from 'src/app/functions/display';
import { Edge } from 'src/app/models/vertex/vertex';
import { Timeable } from 'src/app/models/interfaces/timeable';
import { ModeleService } from 'src/app/services/modele.service';
import { ConfirmDeleteDialogComponent } from 'src/app/modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { finalize } from 'rxjs';
import { BioEvent } from 'src/app/models/vertex/event';
import { VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';

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

  @Input() modele: Modele;

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
    console.log('SCENE draw ', this.modele, ' ', this.curves);
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
    };
  }

  // chart updates

  /**
   * check if curves / triggers / timeStamp display need to be update
   * update them if needed
   */
  updateChart() {
    console.log('updateChart');
    console.log('this.modele.triggeredEvents ',this.modele.triggeredEvents,' ',this.modele.triggeredEvents.size);
    console.log('this.triggeredEvents ',this.triggeredEvents);

    let series: any[] = Array.from(this.curves).map(([key, curve]) => ({
      name: curve.name,
      type: 'line',
      data: curve.values,
      lineStyle: { color: curve.color },
      itemStyle: { color: curve.color },
    }));

    if (!isDeepEqual(series, this.series)) {
      this.series = structuredClone(series);
      this.mergeOptions = {
        series: this.series,
      };
    }

    if (!isMapDeepEqual(this.modele.triggeredEvents, this.triggeredEvents)) {
      let update = () => {
        console.log('update trigger bar');
        console.log(
          'this.modele.triggeredEvents ',
          this.modele.triggeredEvents
        );
        if (echartsInstance) {
          this.updateTriggerBars();
        } else {
          setTimeout(update, 2000);
        }
      };

      update();
    }

/*     if (this.modele.timeStamps && !isMapDeepEqual(this.modele.timeStamps, this.timeStamps)) {
      if (echartsInstance) {
        this.timeStamps = this.modele.timeStamps;
        this.updateTimeStampBars();
      }
    }
 */
    let bioevents = new Map<string, BioEvent>();
    this.modele.graph.nodes.forEach((node: Node, key: string) => {
      if (Node.getType(node) === EventType.bio) {
        let template = (node as Event).template;
        bioevents.set(template.id, template as BioEvent);
      }
    });

    console.log('bioevents ',bioevents)

    if (!isMapDeepEqual(bioevents, this.bioEvents)) {
      let update = () => {
        if (
          echartsInstance &&
          echartsInstance['_model'] &&
          bioevents.size !== this.bioEvents.size
        ) {
          this.updateBioBars(bioevents);
        } else {
          setTimeout(update, 2000);
        }
      };

      update();
    }
  }

  createBar(
    horizontal: boolean,
    position: number, //trigger.time
    index: string,
    label: string,
    color:string,
    draggable:boolean|string,
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
      draggable: draggable,
      ondrag: function (params) {
        let x = params.target.x;
        let y = params.target.y;
        let pointInGrid = horizontal
          ? echartsInstance.convertFromPixel('grid', [0, y])
          : echartsInstance.convertFromPixel('grid', [x, 0]);
        let newPosition = horizontal
          ? Math.round(pointInGrid[1])
          : Math.round(pointInGrid[0]);
        if (newPosition !== position && newPosition>=0) {
          onDrag(index, newPosition);
        }
      },
      onclick: function (params) {
        onClick(index);
      },

      children: [
        {
          id: 'bar_' + index,
          $action: 'replace',
          z: 100,
          type: 'rect',
          left: horizontal ? '50px' : 'center',
          top: horizontal ? 'center' : '50px',
          shape: horizontal
            ? {
                width: 2000,
                height: 1,
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
          $action: 'replace',
          type: 'text',
          z: 100,
          top: horizontal ? '-15px' : '35px',
          left: horizontal ? '65px' : 'center',
          style: {
            text: horizontal ? 'Seuil ' + label : label,
            font: horizontal ? '8px, sans-serif' : '15px, sans-serif',
          },
        },
        {
          id: 'circle_' + index,
          $action: 'replace',
          type: 'circle',
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
          id: 'time_' + index,
          $action: 'replace',
          type: 'text',
          z: 100,
          top: horizontal ? 'center' : '448.5px',
          left: horizontal ? '43px' : 'center',
          style: {
            text: position,
            font: '8px, sans-serif',
            fill: colorContrast(color),
          },
        },
      ],
    };
  }

  updateBar(horizontal: boolean, index: string, position: number) {
    let offset = horizontal
      ? echartsInstance.convertToPixel('grid', [0, position])[1]
      : echartsInstance.convertToPixel('grid', [position, 0])[0];
    return {
      id: index,
      x: horizontal ? 0 : offset,
      y: horizontal ? offset : 0,
      children: [
        {
          id: 'time_' + index,
          style: {
            text: position,
          },
        },
      ],
    };
  }

  removeBar(index:string) {
    return [
        {
          id: 'bar_' + index,
         $action: 'remove',
        },
        {
          id: 'label_' + index,
         $action: 'remove',
        },
        {
          id: 'circle_' + index,
          $action: 'remove',
        },
        {
          id: 'time_' + index,
          $action: 'remove',
        },
      ]
  }

  updateTriggerBars() {
    let newTriggers = structuredClone(this.modele.triggeredEvents);
    let triggerBars = [];

    if (this.triggeredEvents.size < newTriggers.size) {
      let barsToCreate = differenceMaps<Trigger>(newTriggers,this.triggeredEvents)
      triggerBars = Array.from(barsToCreate).map(([index, trigger]) => {
        let onDrag = function (index: string, newTime: number) {
          let newTrigger = scene.modele.triggeredEvents.get(index);
          newTrigger.time = newTime;
          scene.updateTrigger.emit(newTrigger as Trigger);
          if (trigger.editable)
            scene.modeleService.updateTrigger(newTrigger).subscribe();
        };

        let onClick = function (index) {
          let trigger = scene.modele.triggeredEvents.get(index);
          if (trigger.in !== EventType.start) {
            // we do not delete the start trigger
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
                      scene.modele.triggeredEvents.delete(trigger.id);
                      scene.updateTrigger.emit(undefined);
                    });
                }
              }
            });
          }
        };

        return this.createBar(
          false,
          trigger.time,
          trigger.id,
          trigger.name,
          trigger.color,
          trigger.editable? 'horizontal': false , // 'vertical' the drag is on the oppisite direction
          onDrag,
          onClick
        );
      });

    } else if (this.triggeredEvents.size > newTriggers.size) {
      let barsToDelete = differenceMaps<Trigger>(this.triggeredEvents,newTriggers)
      console.log('BAR TO DELETE ', barsToDelete);

      triggerBars = Array.from(barsToDelete).map(([index, trigger]) => {
        return this.removeBar(trigger.id);
      })[0];
    } else {
      console.log('BAR TO UPDATE');
      console.log("this.triggeredEvents ",this.triggeredEvents)
      console.log("newTriggers ",newTriggers)

      let barsToUpdate = new Map(
        [...newTriggers].filter(([key, trigger]) => {
          return !isDeepEqual(trigger, this.triggeredEvents.get(trigger.id));
        })
      );

      triggerBars = Array.from(barsToUpdate).map(([index, trigger]) => {
        return this.updateBar(false, trigger.id, trigger.time);
      });
    }

    console.log('triggerBars ',triggerBars)

    let graphic = { elements: triggerBars };

    this.mergeOptions = {
      graphic: graphic,
      series: this.series,
    };

          console.log('echartsInstance ',echartsInstance);

    this.triggeredEvents = newTriggers;

  }

  updateBioBars(newBioevents: Map<string, BioEvent>) {
    let bioBars = [];

    if (this.bioEvents.size < newBioevents.size) {
      let barsToCreate = differenceMaps<BioEvent>(newBioevents,this.bioEvents)

      bioBars = Array.from(barsToCreate).map(([index, bioevent]) => {
        let onDrag = function (index: string, newTime: number) {
          // biobars are not draggable
        };

        let onClick = function (index) {
          //biobars are not clickable
        };

        return this.createBar(
          true,
          bioevent.threshold,
          bioevent.id,
          bioevent.name,
          VariablePhysioTemplate.variables.get(bioevent.source).color,
          false,
          onDrag,
          onClick
        );
      });
    }
    else if (this.bioEvents.size > newBioevents.size) {
      let barsToDelete = differenceMaps<BioEvent>(this.bioEvents,newBioevents)
      bioBars = Array.from(barsToDelete).map(([index, bioevent]) => {
        return this.removeBar(bioevent.id);
      })[0];
    }else {
      let barsToUpdate = new Map(
        [...newBioevents].filter(([key, bioevent]) => {
          return !isDeepEqual(bioevent, this.bioEvents.get(bioevent.id));
        })
      );

      bioBars = Array.from(barsToUpdate).map(([index, bioevent]) => {
        return this.updateBar(false, bioevent.id, bioevent.threshold);
      });
    }


    let graphic = { elements: bioBars };
    this.mergeOptions = {
      graphic: graphic,
    };
    this.bioEvents = newBioevents;
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
          'horizontal',
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
          let nodeTriggered =  getNodeByID(this.modele.graph, newTrigger.in)     
          this.modeleService
            .createTrigger(newTrigger, this.modele)
            .subscribe((res: Trigger) => {
              newTrigger.id = res.id;
              newTrigger.color = Button.getButtonByType(Node.getType(nodeTriggered)).color
              newTrigger.name = Node.getName(nodeTriggered);
              this.modele.triggeredEvents.set(res.id, newTrigger);
               this.updateTrigger.emit(newTrigger);
            });
        } else {
          let newTimeStamp = result as Timestamp;
           this.modele.timeStamps.set(newTimeStamp.id,newTimeStamp);
        }
      }
    });
  }
}
