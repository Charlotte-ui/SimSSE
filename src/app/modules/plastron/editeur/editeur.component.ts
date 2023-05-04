import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Trend,
  Event,
  Node,
  Link,
  Graph,
  BioEvent,
  Action,
  NodeType,
  EventType,
  Timer,
} from '../../core/models/node';
import {
  VariablePhysio,
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../core/models/variablePhysio';
import { Target } from '@angular/compiler';
import { RegleService } from '../../core/services/regle.service';
import { NodeService } from '../../core/services/node.service';
import { GraphDialogComponent } from './graph-dialog/graph-dialog.component';
import { retry } from 'rxjs';
import { Modele } from '../../core/models/modele';
import { Curve } from '../../core/models/curve';
import { ModeleService } from '../../core/services/modele.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less'],
})
export class EditeurComponent implements OnInit {
  // affichage dynamic des boites retractable
  barreOutilsOpened: boolean;
  inspecteurOpened: boolean;

  _targetVariable!: VariablePhysioInstance[];

  get targetVariable(): VariablePhysioInstance[] {
    return this._targetVariable;
  }
  @Input() set targetVariable(value: VariablePhysioInstance[]) {
    if (value) {
      // if value isnt undefined
      this._targetVariable = value;
      this.initCurves();
    }
  }

  _modele!: Modele;
  get modele(): Modele {
    return this._modele;
  }
  @Input() set modele(value: Modele) {
    if (value) {
      this._modele = value;
      this.initGragh();
    }
  }

  @Input() duration: number = 100;
  @Input() variablesTemplate: VariablePhysioTemplate[];

  // liste de tout les modèles d'événements et de graphs existant
  allBioevents!: BioEvent[];
  allActions!: Action[];
  allGraphs!: Graph[];

  /**
   * all currents trends in the nodes
   */
  trends!: Trend[];

  /**
   * all currents events in the nodes, theirs ids and the id of the graph their from
   * is there from the current graph id=-1
   */
  //events: [Event, number, number][];
  events: Event[];

  /**
   * courbes des data simulées
   */
  curves: Curve[];

  /**
   * préviens le plastron quand un changement a besoin d'être enregistré
   */
  @Output() newChange = new EventEmitter<boolean>();

  constructor(
    public dialog: MatDialog,
    public reglesService: RegleService,
    public nodeService: NodeService,
    private modelService: ModeleService
  ) {}

  // --- INITIALISATEURS -----------------------------------------

  ngOnInit(): void {
    this.reglesService.getBioEvents().subscribe((response) => {
      this.allBioevents = response as BioEvent[];
    });

    this.reglesService.getActions().subscribe((response) => {
      this.allActions = response as Action[];
    });

    this.nodeService.getGraphTemplate().subscribe((response) => {
      this.allGraphs = response;
    });
  }

  /**
   * init graph
   */
  initGragh() {
    this.modelService.getGraph(this.modele.id).subscribe((graph: Graph) => {
      this.modele.graph = graph;

      this.modelService.getGraphNodes(graph.id).subscribe((nodes: Node[]) => {
        this.modele.graph.nodes = nodes;

        let nodeIDArray = nodes.map((node: Node) => node.id).filter(n => n);

        // TODO add node template
        this.modele.graph.nodes.forEach((node) => {
          if (
            node.type == NodeType.event &&
            (node as Event).typeEvent !== EventType.start
          ) {
            this.nodeService
              .getEventTemplate(
                (node as Event).event,
                (node as Event).typeEvent
              )
              .subscribe((template) => {
                node['template'] = template;
             //   this.replaceEventByTemplate(node as Event);
              });
          }
        });

        this.modelService
          .getGraphLinks(nodeIDArray)
          .subscribe((links: Link[]) => {
            // replace id node by event name so an event is triggered wathever his id is

            links.forEach((link: Link) => {
              let nodeSource = this.getNodeByID(link.out);
              if (nodeSource.type == NodeType.event)
                  link.out = (nodeSource as Event).event;

            });

            this.modele.graph.links = links;

            if (this.targetVariable) this.initCurves();

            this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
          });

        //  this.events = new Array<[Event, number, number]>(); // id event and id graph
        this.trends = [];
        this.events = [];
        this.initTrendsEventsRecursive(this.modele.graph);
      });
    });
  }

  /**
   * initialize all curves
   */
  initCurves() {
    this.curves = [];
    this.targetVariable.forEach((variable, index) => {
      let curve = new Curve(variable.name, this.duration, variable, variable.color);
      this.curves.push(curve);
      curve.calculCurve(structuredClone(this.modele));
    });
  }

  initTrendsEventsRecursive(graph: Graph) {
    graph.nodes.forEach((node, i) => {
      switch (node.type) {
        case 'event':
          //this.events.push([node as Event, i, Number(graph.id)]); // if the node is an event TODO i is redandant with id ?
          graph.nodes[i]['template'] = Action.getActionByID(
            (node as Event).event
          );

          this.events.push(node as Event);
          break;
        case 'trend':
          this.trends.push(node as Trend);
          break;
        case 'graph':
          this.initTrendsEventsRecursive(node as Graph);
          break;
      }
    });
  }

  initGroup(group: Graph) {
    group.links = this.allGraphs[Number(group.gabarit)].links;
    group.nodes = this.allGraphs[Number(group.gabarit)].nodes;
  }

  // --- UPDATEURS -----------------------------------------

  addElement(element: Node | Link) {
    if (element.type == NodeType.link) {
      // TODO element instanceof Node doesn't work
      let indice = this.modele.graph.links.length.toString();
      (element as Link).id = indice;
      this.modele.graph.links.push(element as Link);
    } else {
      let indice = this.modele.graph.nodes.length.toString();
      element.id = indice;
      if (element.type == NodeType.graph) this.initGroup(element as Graph);
      this.modele.graph.nodes.push(element as Node);
    }
    this.modele = structuredClone(this.modele); // TODO force change detection by forcing the value reference update
    this.initCurves();
    this.curves = [...this.curves];
    this.newChange.emit(true);
  }

  updateNodes(event) {
    console.log("updateNodes")
    console.log(event)
    if (event[0] == 'delete') {
      this.updateCurve();
    } else {
      let node = event[0] as Node;
      let index = event[1];
      console.log("newnode")
      console.log(node)
      this.modele.graph.nodes[index] = node;
/*       if (node.type == 'trend') {
        // si seule une trend est modifiée on ne change qu'une courbe, sinon tout le graph change
        let trend = node as Trend; // TODO ; pour le moment pas util à cause du this.graph = structuredClone(this.graph);, nécessaire pour l'emplacement des nodes
        let variable = this.getVariableByTemplate(trend.target);
        this.curves[index].calculCurve(this.modele);
      } 
      else */ 
      this.updateCurve();
    }
    this.modele.graph = structuredClone(this.modele.graph);
    this.curves = [...this.curves];
    this.newChange.emit(true);
  }

  updateLinks(event) {
    // let index = Number(event[1])
    this.initCurves();
    this.curves = [...this.curves];
    this.newChange.emit(true);
  }

  updateTriggers(event) {
    // let index = Number(event[1])
    this.modele.triggeredEvents = event;
    this.updateCurve()

  }

  updateVariables(event:[VariablePhysioInstance,number]) {
    let index = Number(event[1]);
    let variable = event[0] as VariablePhysioInstance;
    this.targetVariable[index] = variable;
    // comme targetVariable est un tableau donc un objet, changer la valeur d'un élement de modifie pas le pointeur
    // et donc le @Input: targetVariable du composant Scene n'est pas trigger
    // on peut utiliser this.targetVariable = [...this.targetVariable] pour forcer l'update
    // mais alors toutes les courbes sont recalculées
    // pour ne recalculer qu'une seule courbe, on utilise la variable varToUpdate
    // ce qui trigger le @Input: varToUpdate du composant Scene
    console.log("this.targetVariable")
    console.log(this.targetVariable)

    this.curves[index].variable = variable;
    this.curves[index].calculCurve(this.modele);
    this.curves = [...this.curves];
    this.newChange.emit(true);
  }

  updateCurve(){
    this.curves.forEach((curve) => {
      curve.calculCurve(structuredClone(this.modele));
    });
    this.curves = [...this.curves];
  }

  // --- TOOLS -----------------------------------------

  getVariableByTemplate(idTemplate: string): VariablePhysioInstance {
    let res = undefined;
    this.targetVariable.forEach((variable) => {
      if (variable.template == idTemplate) res = variable;
    });
    return res;
  }

  // tools
  /*
  isNodeTrigger(nodeTriggers,node):boolean|undefined{
    let res = undefined;
    nodeTriggers.forEach(nodeTrigger => {
      if (nodeTrigger[0] == node.id) res = nodeTrigger[1];// res is true si le trigger est un start, false si c'est un stop
      }
    );
    return res;
  } */

  getNodeByID(id: string): Node {
    let result = undefined;
    this.modele.graph.nodes.forEach((node: Node) => {
      if (node.id == id) result = node;
    });
    return result;
  }
}
