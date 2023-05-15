import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button, IButton } from 'src/app/models/buttons';
import {
  EventType,
  Graph,
  NodeType,
  Timer,
  Trend,
  Event,
  Node,
  Action,
  BioEvent,
  Link,
} from 'src/app/models/vertex/node';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from 'src/app/models/vertex/variablePhysio';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less'],
})
export class BarreOutilsComponent implements OnInit {
  // liste de tout les modèles d'événements et de graphs existant
  @Input() allBioevents!: BioEvent[];
  @Input() allActions!: Action[];
  @Input() allGraphs!: Graph[];
  @Input() variables!: VariablePhysioTemplate[];
  @Input() nodes!: Node[];

  @Output() newElement = new EventEmitter<Node | Link>();

  buttons!: IButton[];

  constructor(public dialog: MatDialog) {
    this.buttons = Button.buttons;
  }

  ngOnInit(): void {}

  addElement(element: string) {
    let x = 50; // l'element est ajouter au milieu
    let y = 50;

    switch (element) {
      case NodeType.link:
        return this.createLink();
      case EventType.bio:
        let bioevent = new Event({ typeEvent: EventType.bio });
        return this.createNode(bioevent, this.allBioevents);
      case EventType.action:
        let action = new Event({ typeEvent: EventType.action });
        return this.createNode(action, this.allActions,['template']);
      case NodeType.trend:
        let trend = new Trend();
        return this.createNode(trend, this.variables);
      case NodeType.graph:
        let group = new Graph();
        return this.createNode(group, this.allGraphs);
      case NodeType.timer:
        let timer = new Timer();
        return this.createNode(timer, []);
    }
  }

  createLink() {
    let link: Link = new Link();

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [link,Link, this.nodes, false],
    });

    dialogRef.afterClosed().subscribe((result: Link) => {
      if (result) {
        console.log('create link ');
        console.log(result);
        this.newElement.emit(result);
      }
    });
  }

  createNode(newNode: Node, liste: any[],hidden?:string[]) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newNode,Node, liste, false,hidden],
    });

    dialogRef.afterClosed().subscribe((newNode: Node) => {
      if (newNode) {
        console.log('node created');
        console.log(newNode);

        if (newNode.type == NodeType.event) {
          newNode['template'] = this.getTemplate(
            (newNode as Event).typeEvent == EventType.action
              ? this.allActions
              : this.allBioevents,
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
