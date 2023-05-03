import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button, IButton } from 'src/app/modules/core/models/buttons';
import { EventType, Graph, NodeType, Timer, Trend,Event,Node, Action, BioEvent, Link } from 'src/app/modules/core/models/node';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { VariablePhysioInstance } from 'src/app/modules/core/models/variablePhysio';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less']
})
export class BarreOutilsComponent implements OnInit {

  // liste de tout les modèles d'événements et de graphs existant
  @Input() allBioevents!: BioEvent[];
  @Input() allActions!: Action[];
  @Input() allGraphs!: Graph[];
  @Input() targetVariable!: VariablePhysioInstance[];
  @Input() nodes!: Node[];

  @Output() newElement = new EventEmitter<Node|Link>();

  buttons!:IButton[]; 

  constructor(public dialog: MatDialog) {
    this.buttons = Button.buttons;
  }

  ngOnInit(): void {
  }


  addElement(element: string) {
    let x = 50; // l'element est ajouter au milieu
    let y = 50;

    switch (element) {
      case NodeType.link:
        return this.createLink();
      case EventType.bio:
        let bioevent = new Event({type:EventType.bio});
        return this.createNode(bioevent,this.allBioevents);
      case EventType.action:
        let action = new Event({type:EventType.action});
        return this.createNode(action,this.allActions);
      case NodeType.trend:
        let trend = new Trend ()
        return this.createNode(trend,this.targetVariable);
      case NodeType.graph:
        let group = new Graph()
        return this.createNode(group,this.allGraphs);
      case NodeType.timer:
        let timer = new Timer()
        return this.createNode(timer,[]);
    }
  }

  createLink() {
    let link: Link = new Link("");

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [link, this.nodes,false],
    });

    dialogRef.afterClosed().subscribe((result:Link) => {
      if (result) {
        console.log("create link ")
        console.log(result)
        this.newElement.emit(result);
      }
    });
  }

  createNode(newNode: Node,liste:any[]) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newNode, liste,false],
    });

    dialogRef.afterClosed().subscribe((result:Node) => {
      if (result) {
        this.newElement.emit(result);
      }
    });
  }




}
