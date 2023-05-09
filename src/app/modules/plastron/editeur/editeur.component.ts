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
} from '../../core/models/vertex/node';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../core/models/vertex/variablePhysio';
import { RegleService } from '../../core/services/regle.service';
import { NodeService } from '../../core/services/node.service';
import { Observable, concat, forkJoin, of, switchMap, zipAll } from 'rxjs';
import { Modele } from '../../core/models/vertex/modele';
import { Curve } from '../../core/models/curve';
import { ModeleService } from '../../core/services/modele.service';

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
      this.modelService
        .getGraph(this.modele.id)
        .pipe(
          switchMap((graph: Graph) => {
            this.modele.graph = graph;
            return this.initGraph(this.modele.graph);
          })
        )
        .subscribe((result: [(BioEvent | Action)[], Link[]]) => {
          let getNodeByID = (id: string): Node => {
            let result = undefined;
            this.modele.graph.nodes.forEach((node: Node) => {
              if (node.id == id) result = node;
            });
            return result;
          };

          this.modele.graph.nodes.map((node: Node, index: number) => {
            if (node['template']) node['template'] = result[0][index];
          });

          this.modele.graph.links = result[1];

          // if the link point to an event replace the node id by the event so an all event nodes are triggered at once
          this.modele.graph.links.forEach((link: Link) => {
            let nodeSource = getNodeByID(link.out);
            if (nodeSource.type == NodeType.event)
              link.out = (nodeSource as Event).event;
          });

          // if the initialized graph is the root graph
          if (this.targetVariable) {
            this.initCurves();
            this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
          }

          // TODO : find the rigth place foor that
          this.trends = [];
          this.events = [];
          this.initTrendsEventsRecursive(this.modele.graph);
        });
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
  events: Event[];

  /**
   * courbes des data simulées
   */
  curves: Curve[];

  /**
   * préviens le plastron quand un changement a besoin d'être enregistré
   */
  @Output() newChange = new EventEmitter<boolean>();

  /**
   * préviens le plastron quand un changement a besoin d'être enregistré
   */
  @Output() newCurve = new EventEmitter<Curve[]>();

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
   * init all the nodes and links of a graph
   * @param graphId
   */
  initGraph(graph: Graph): Observable<[(BioEvent | Action)[], Link[]]> {
    return this.modelService.getGraphNodes(graph.id).pipe(
      switchMap((nodes: Node[]) => {
        graph.nodes = nodes;
        let nodeIDArray = nodes.map((node: Node) => node.id).filter((n) => n);
        const requestsTemplate = nodes.map((node: Node) => {
          if (
            node.type == NodeType.event &&
            (node as Event).typeEvent !== EventType.start
          ) {
            return this.nodeService.getEventTemplate(
              (node as Event).event,
              (node as Event).typeEvent
            );
          } else return of(undefined);
        });
        const requestLink = this.modelService.getGraphLinks(nodeIDArray);
        return forkJoin([concat(requestsTemplate).pipe(zipAll()), requestLink]);
      })
    );
  }

  /**
   * initialize all curves
   */
  initCurves() {
    this.curves = [];
    this.targetVariable.forEach((variable, index) => {
      let curve = new Curve(
        variable.name,
        this.duration,
        variable,
        variable.color
      );
      this.curves.push(curve);
      curve.calculCurve(structuredClone(this.modele));
    });

    this.newCurve.emit(this.curves);
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
    let graphTemplate = Graph.getGraphByID(group.template.toString());

    this.initGraph(graphTemplate).subscribe(
      (result: [(BioEvent | Action)[], Link[]]) => {
        let getNodeByID = function (id: string): Node {
          let result = undefined;
          graphTemplate.nodes.forEach((node: Node) => {
            if (node.id == id) result = node;
          });
          return result;
        };
        graphTemplate.nodes.map((node: Node, index: number) => {
          if (node['template']) node['template'] = result[0][index];
        });

        graphTemplate.links = result[1];

        // if the link point to an event replace the node id by the event so an all event nodes are triggered at once
        graphTemplate.links.forEach((link: Link) => {
          let nodeSource = getNodeByID(link.out);
          if (nodeSource.type == NodeType.event)
            link.out = (nodeSource as Event).event;
        });

        // TODO : créer de nouveaux node and links avec de nouveaux id ?
        group.links = structuredClone(graphTemplate.links);
        group.nodes = structuredClone(graphTemplate.nodes);
        this.modele.graph.nodes.push(group);
        this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
      }
    );
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
      else this.modele.graph.nodes.push(element as Node);
    }
    this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
    this.updateCurve();
    this.newChange.emit(true);
  }

  updateNodes(event) {
    if (event[0].delete) {
      let idNodeToDelete = event[0].id;
      // delete all the links link to the deleted node
      this.modele.graph.links.forEach((link) => {
        if (link.in == idNodeToDelete || link.out == idNodeToDelete)
          this.modele.graph.links.splice(
            this.modele.graph.links.indexOf(link),
            1
          );
      });
    } else {
      let node = event[0] as Node;
      let index = event[1];
      this.modele.graph.nodes[index] = node;
      /*       if (node.type == 'trend') {
        // si seule une trend est modifiée on ne change qu'une courbe, sinon tout le graph change
        let trend = node as Trend; // TODO ; pour le moment pas util à cause du this.graph = structuredClone(this.graph);, nécessaire pour l'emplacement des nodes
        let variable = this.getVariableByTemplate(trend.target);
        this.curves[index].calculCurve(this.modele);
      } 
      else */
    }
    this.updateCurve();
    this.modele.graph = structuredClone(this.modele.graph);
    this.newChange.emit(true);
  }

  updateLinks(event) {
    console.log("updateLinks")
        console.log(event)

    // let index = Number(event[1])
    this.updateCurve();
    this.newChange.emit(true);
  }

  updateTriggers(event) {
    // let index = Number(event[1])
    this.modele.triggeredEvents = event;
    this.updateCurve();
  }

  updateVariables(event: [VariablePhysioInstance, number]) {
    let index = Number(event[1]);
    let variable = event[0] as VariablePhysioInstance;
    this.targetVariable[index] = variable;
    // comme targetVariable est un tableau donc un objet, changer la valeur d'un élement de modifie pas le pointeur
    // et donc le @Input: targetVariable du composant Scene n'est pas trigger
    // on peut utiliser this.targetVariable = [...this.targetVariable] pour forcer l'update
    // mais alors toutes les courbes sont recalculées
    // pour ne recalculer qu'une seule courbe, on utilise la variable varToUpdate
    // ce qui trigger le @Input: varToUpdate du composant Scene

    this.curves[index].variable = variable;
    this.curves[index].calculCurve(this.modele);
    this.curves = [...this.curves];
    this.newChange.emit(true);
  }

  updateCurve() {
    this.curves.forEach((curve) => {
      // clean the triggereds of all the curves-genereted triggerd
      this.modele.triggeredEvents = this.modele.triggeredEvents.filter(
        (trigger) => trigger.editable
      );
      let newtriggered = curve.calculCurve(structuredClone(this.modele));
      this.modele.triggeredEvents = newtriggered;
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
}
