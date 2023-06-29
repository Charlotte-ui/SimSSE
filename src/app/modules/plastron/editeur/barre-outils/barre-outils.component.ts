import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button, IButton } from 'src/app/functions/display';
import {
  EventType,
  Graph,
  NodeType,
  Timer,
  Trend,
  Event,
  Node,
  Link,
} from 'src/app/models/vertex/node';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from 'src/app/models/vertex/variablePhysio';
import { MatDialog } from '@angular/material/dialog';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { refCount } from 'rxjs';
import { getElementByChamp, getNodeByID } from 'src/app/functions/tools';
import { NodeService } from 'src/app/services/node.service';
import { AddMultipleTrendsDialogComponent } from './add-multiple-trends-dialog/add-multiple-trends-dialog.component';

@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less'],
})
export class BarreOutilsComponent implements OnInit {
  actionByCategories;
  bioEventByCategories;

  variableTemplates: Map<string, VariablePhysioTemplate>;
  @Input() nodes!: Node[];

  @Output() newElement = new EventEmitter<Node | Link>();
  @Output() newStartTrends = new EventEmitter<Trend[]>();

  buttons!: IButton[];

  constructor(public dialog: MatDialog, public nodeService: NodeService) {
    this.buttons = Button.buttons;
    this.variableTemplates = VariablePhysioTemplate.variables;
  }

  ngOnInit(): void {}

  triggerEvent(event: string, element: string) {
    if (event === 'add') return this.addElement(element);

    if (event === 'store') return this.stockInBDD();
    if (event === 'addMultiple') return this.addMultipleElement();
  }

  addElement(element: string) {
    this.actionByCategories = Action.getListByCategory();
    this.bioEventByCategories = BioEvent.getListByCategory();
    switch (element) {
      case NodeType.link:
        return this.createLink();
      case EventType.bio:
        let bioevent = new Event({ typeEvent: EventType.bio });
        return this.createNode(bioevent, this.bioEventByCategories, [
          'template',
        ]);
      case EventType.action:
        let action = new Event({ typeEvent: EventType.action });
        return this.createNode(action, this.actionByCategories, ['template']);
      case NodeType.trend:
        let trend = new Trend();
        return this.createNode(trend, this.variableTemplates);
      case NodeType.graph:
        let group = new Graph();
        return this.createNode(group, Graph.graphs);
      case NodeType.timer:
        let timer = new Timer();
        return this.createNode(timer);
    }
  }

  /**
   * stock a graph in bdd as a group modele
   */
  stockInBDD() {
    // get all groupe that arent an template yet
    let groupes = this.nodes.filter(
      (node: Node) =>
        node.type === NodeType.graph && (node as Graph).template !== true
    );
    console.log('groupes ', groupes);
    console.log('this.nodes ', this.nodes);

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [
        { groupToStore: undefined, type: 'groupe en base de donnée' },
        Graph,
        groupes,
        false,
      ],
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(result);
        let groupToStore = getElementByChamp<Node>(
          groupes,
          'id',
          result.groupToStore
        );
        this.nodeService
          .copyGraph(groupToStore as Graph, true)
          .subscribe((graph: Graph) => {
            console.log('graph template ', graph);
            Graph.graphs.set(graph.id,graph);
          });
      }
    });
  }

  addMultipleElement() {
    const dialogRef = this.dialog.open(AddMultipleTrendsDialogComponent, {
      data: [],
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        let trends: Trend[] = [];
        for (const [key, value] of Object.entries(result)) {
          console.log(`${key}: ${value}`);
          if (value !== 0)
            trends.push(
              new Trend({
                target: key,
                parameter: value,
                name: `T0 ${this.variableTemplates.get(key).name} ${Number(value)>0 ? '+' : '-'}`,
                x:70,
                y:50*trends.length
              })
            );
        }
        this.newStartTrends.emit(trends);
      }
    });
  }

  createLink() {
    let link: Link = new Link();

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [link, Link, this.nodes, false],
    });

    dialogRef.afterClosed().subscribe((result: Link) => {
      if (result) {
        this.newElement.emit(result);
      }
    });
  }

  createNode(newNode: Node, map?: Map<string,any>, hidden?: string[]) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newNode, Node, map, false, hidden]
    });

    dialogRef.afterClosed().subscribe((newNode: Node) => {
      if (newNode) {
        if (newNode.type == NodeType.event) {
          newNode['template'] = this.getTemplate(
            (newNode as Event).typeEvent == EventType.action
              ? Action.actions
              : BioEvent.bioevents,
            (newNode as Event).event
          );
        }
        this.newElement.emit(newNode);
      }
    });
  }

  getTemplate(listTemplate: any[], id): any {
    let res = undefined;
    listTemplate.forEach((template) => {
      if (template.id == id) res = template;
    });

    return res;
  }
}
