import {
  Component,
  OnInit,
  Inject,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption, util } from 'echarts';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import {
  Trend,
  Event,
  Link,
  Graph,
  Node,
  BioEvent,
  Action,
} from 'src/app/modules/core/models/node';
import * as echarts from 'echarts/types/dist/echarts';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';
import { GraphEditeurDialogComponent } from './graph-editeur-dialog/graph-editeur-dialog.component';
import { NodeType } from 'src/app/modules/core/models/node';
import { EventType } from 'src/app/modules/core/models/node';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from 'src/app/modules/core/models/variablePhysio';
import { Button } from 'src/app/modules/core/models/buttons';

const GREEN = '#2E933C';
const RED = '#DE1A1A';

let DataName = [];

@Component({
  selector: 'app-editeur-graphe-nodal',
  templateUrl: './editeur-graphe-nodal.component.html',
  styleUrls: ['./editeur-graphe-nodal.component.less'],
})
export class EditeurGrapheNodalComponent implements OnInit {
  echartsInstance;
  mergeOptions = {};

  _graph!: Graph;
  get graph(): Graph {
    return this._graph;
  }
  @Input() set graph(value: Graph) {
    if (value) {
      this._graph = value;
      if (value.links && value.links.length>0) this.initGraphLink();
      if (value.nodes && value.nodes.length>0) this.initGraphData();
      if (value.nodes && value.links) this.updateChart();

    }
  }

  @Input() allBioevents!: BioEvent[];
  @Input() allActions!: Action[];
  @Input() targetVariable!: VariablePhysioInstance[];
  @Input() variablesTemplate!: VariablePhysioTemplate[];

  @Output() updateNode = new EventEmitter<Node[]>();
  @Output() updateLink = new EventEmitter<Link[]>();

  graphData = [];

  graphLink = [];

  initialChartOption: EChartsOption = {
    tooltip: {},
    grid: {
      show: false,
      right: '0',
      bottom: '0',
      top: '0',
      left: '0',
    },
    xAxis: {
      show: false,
      min: 0,
      max: 100,
      type: 'value',
    },
    yAxis: {
      show: false,
      min: 0,
      max: 100,
      type: 'value',
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [],
  };

  categories = [];

  @ViewChild('graphScene') graphScene: ElementRef;

  constructor(public dialog: MatDialog) {
    Button.buttons.forEach((button) => {
      this.categories.push({
        name: button.type,
        itemStyle: { color: button.color },
        symbol: button.symbol,
      });
    });
  }

  ngOnInit(): void {}

  //initialisateurs

  initGraphData() {
    this.graphData = new Array(this.graph.nodes.length);

    DataName = [];
    this.graph.nodes.forEach((node: Node, index: number) => {
      let draggable =
        node.type == NodeType.event &&
        (node as Event).typeEvent == EventType.start
          ? false
          : true;

      let name;
      let label;
      switch (node.type) {
        case NodeType.event:
           label = (node as Event).template
            ? (node as Event).template.name
            : (node as Event).typeEvent; 
            name = (node as Event).event
          break;
        case NodeType.timer:
          name = node.type;
          label = node.type;
          break;
        default:
          name = (node as Trend | Graph).name;
          label = (node as Trend | Graph).name;
      }

      DataName.push(label);

      let cat =
        node.type == NodeType.event ? (node as Event).typeEvent : node.type;

      this.graphData[index] = {
        name: node.type == NodeType.event ? name : node.id,
        category: cat,
        draggable: draggable,
        layout: 'none',
        value: [node.x, node.y],
      };
    });
  }

  initGraphLink() {
    this.graphLink = new Array(this.graph.links.length);

    this.graph.links.forEach((link: Link, index: number) => {
      let color = link.start ? GREEN : RED;
      //let source = (Number.isNaN(Number(link.out)))?link.out:Number(link.out);
      this.graphLink[index] = {
        source: link.out, //source, // name of the node
        target: link.in, // id of the node
        lineStyle: { color: color },
      };
    });
  }

  //updateurs

  updateChart() {

    let series = [
      {
        type: 'graph',
        layout: 'none',
        coordinateSystem: 'cartesian2d',
        symbol: 'roundRect',
        symbolSize: [70, 30],
        roam: true,
        label: {
          show: true,
          formatter: function (d) {
            return DataName[d.dataIndex];
          },
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [10, 10],
        edgeLabel: {
          fontSize: 20,
        },
        data: this.graphData,
        links: this.graphLink,
        categories: this.categories,
        lineStyle: {
          opacity: 1,
          width: 1,
          curveness: 0.3,
        },
      },
    ];

    this.mergeOptions = {
      series: series,
    };
  }

  updateNodeCoordinate(offsetX: number, offsetY: number, node: Node) {
    let width = this.graphScene.nativeElement.clientWidth;
    let height = this.graphScene.nativeElement.clientHeight;
    let newX = (offsetX / width) * 100;
    let newY = ((height - offsetY) / height) * 100; // passage de coordonnees matricielles à graphiques
    node.x = newX;
    node.y = newY;
  }

  //event handlers

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  onChartClick(event: any): void {
    if (event.dataType == 'node') return this.onNodeClick(event);
    if (event.dataType == 'edge') return this.onEdgeClick(event);
  }

  onNodeClick(event: any) {
    let index = event.dataIndex;
    let node = this.graph.nodes[index];

    // update the coordinate ; if not is reset to start coordinates
    this.updateNodeCoordinate(event.event.offsetX, event.event.offsetY, node);

    let dialogRef;

    switch (event.data.category) {
      case NodeType.graph:
        dialogRef = this.dialog.open(GraphEditeurDialogComponent, {
          data: node as Graph,
        });
        break;
      case EventType.bio:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node, this.allBioevents, true],
        });
        break;
      case EventType.action:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node, this.allActions, true],
        });
        break;
      case NodeType.trend:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node, this.variablesTemplate, true],
        });
        break;
      case NodeType.timer:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node, [], true],
        });
    }

    if (dialogRef)
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.delete) {
            this.graph.nodes.splice(index, 1);
            this.graphData.splice(index, 1);
          } else {
            result.x = node.x;
            result.y = node.y;
            this.graph.nodes[index] = result;
            this.graphData[index].name = result.name;
          }

          this.updateChart();
          this.updateNode.emit([result, index]);
        }
      });
  }

  onEdgeClick(event: any) {
    let index = event.dataIndex;
    let link = this.graph.links[index];
    let dialogRef = this.dialog.open(DialogComponent, {
      data: [link, this.graph.nodes, true],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.delete) {
          this.graph.links.splice(index, 1);
          this.graphLink.splice(index, 1);
        } else {
          this.graph.links[index] = result;
          this.graphLink[index] = {
            source: Number(result.source),
            target: Number(result.target),
            lineStyle: {
              color: result.start ? '#2E933C' : '#DE1A1A',
            },
            //TODO debbug color
          };
        }
        this.updateChart();
        this.updateLink.emit([result, index]);
      }
    });
  }
}
