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
  Timer,
} from 'src/app/models/vertex/node';
import * as echarts from 'echarts/types/dist/echarts';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';
import { GraphEditeurDialogComponent } from './graph-editeur-dialog/graph-editeur-dialog.component';
import { NodeType } from 'src/app/models/vertex/node';
import { EventType } from 'src/app/models/vertex/node';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from 'src/app/models/vertex/variablePhysio';
import { Button } from 'src/app/functions/display';
import { Action, BioEvent } from 'src/app/models/vertex/event';

const GREEN = '#45C456';
const RED = '#A41313';

let DataName = [];

@Component({
  selector: 'app-editeur-graphe-nodal',
  templateUrl: './editeur-graphe-nodal.component.html',
  styleUrls: ['./editeur-graphe-nodal.component.less'],
})
export class EditeurGrapheNodalComponent implements OnInit {
  echartsInstance;
  mergeOptions = {};
  actionByCategories ;

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
    this.categories = Button.buttons.map(button => (
     {
        name: button.type,
        itemStyle: { color: button.color },
        symbol: button.symbol,
      }
    ));
  }

  ngOnInit(): void {}

  //initialisateurs

  initGraphData() {
    this.graphData = new Array(this.graph.nodes.length);

    DataName = [];
    this.graph.nodes.forEach((node: Node, index: number) => {

      let draggable = Node.getType(node)== EventType.start? false:true;

      let name = Node.getName(node)
      let label = (node.type ==  NodeType.event && (node as Event).template)?(node as Event).template.name:name;

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
    this.graphLink = this.graph.links.map(link=> this.parseLinkIntoGraphLink(link))
  }

  parseLinkIntoGraphLink(link?:Link):any{
     return {
        source: link?.out,
        target: link?.in, 
        lineStyle: { color: link?.start ? GREEN : RED },
      };
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
    this.actionByCategories= Action.getListByCategory()

    let dialogRef;

    switch (event.data.category) {
      case NodeType.graph:
        dialogRef = this.dialog.open(GraphEditeurDialogComponent, {
          data: node as Graph,
        });
        break;
      case EventType.bio:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node,Event, this.allBioevents, true,['template']],
        });
        break;
      case EventType.action:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node, Event,this.actionByCategories, true,['template']],
        });
        break;
      case NodeType.trend:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node,Trend,this.variablesTemplate, true],
        });
        break;
      case NodeType.timer:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node,Timer, [], true],
        });
    }

    if (dialogRef)
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.delete) {
            let deletedNode = this.graph.nodes.splice(index, 1)[0];
            this.graphData.splice(index, 1);
            let ref = deletedNode.id ;

            console.log("deletedNode ",deletedNode)
            
            if (deletedNode.type == NodeType.event) ref = (deletedNode as Event).event;
            console.log("ref ",ref)
            result.ref = ref;
            this.updateNode.emit([result, index]);

          } else {
            result.x = node.x; // keep the update node coordinate
            result.y = node.y;
            this.graph.nodes[index] = result;
            this.graphData[index].name = result.name;
            this.updateNode.emit([result, index]);

          }

          this.updateChart();
        }
      });
  }

  onEdgeClick(event: any) {
    let index = event.dataIndex;
    let link = this.graph.links[index];
    let dialogRef = this.dialog.open(DialogComponent, {
      data: [link, Link,this.graph.nodes, true],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.delete) {
          this.graph.links.splice(index, 1);
          this.graphLink.splice(index, 1);
        } else {
          this.graphLink[index] = this.parseLinkIntoGraphLink(result as Link)
          this.graph.links[index].start = result.start;
        }
        this.updateChart();
        this.updateLink.emit([result, index]);
      }
    });
  }
}
