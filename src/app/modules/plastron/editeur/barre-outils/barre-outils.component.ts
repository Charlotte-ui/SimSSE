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

@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less'],
})
export class BarreOutilsComponent implements OnInit {
  actionByCategories;
  bioEventByCategories;

  @Input() variables!: VariablePhysioTemplate[];
  @Input() nodes!: Node[];

  @Output() newElement = new EventEmitter<Node | Link>();

  buttons!: IButton[];

  constructor(public dialog: MatDialog, public nodeService: NodeService) {
    this.buttons = Button.buttons;
  }

  ngOnInit(): void {}

  triggerEvent(event: string, element: string) {
    if (event === 'add') return this.addElement(element);

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
            Graph.graphs.push(graph);
          });
      }
    });
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
        return this.createNode(trend, this.variables);
      case NodeType.graph:
        let group = new Graph();
        return this.createNode(group, Graph.graphs);
      case NodeType.timer:
        let timer = new Timer();
        return this.createNode(timer, []);
    }
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

  createNode(newNode: Node, liste: any[], hidden?: string[]) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newNode, Node, liste, false, hidden],
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
