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
} from '../../../models/vertex/node';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../../models/vertex/variablePhysio';
import { RegleService } from '../../../services/regle.service';
import { NodeService } from '../../../services/node.service';
import { Observable, concat, forkJoin, of, switchMap, zipAll } from 'rxjs';
import { Modele } from '../../../models/vertex/modele';
import { Curve } from '../../../models/curve';
import { ModeleService } from '../../../services/modele.service';

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
      console.log('this.modele.graph ', this.modele.graph.toString());
      if (this.modele.graph) this.initCurves();
    }
  }

  _modele!: Modele;
  get modele(): Modele {
    return this._modele;
  }
  @Input() set modele(value: Modele) {
    if (value) {
      console.log('editeur input modele ', value);

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
          this.modele.graph.links.map((link: Link) => {
            let nodeSource = getNodeByID(link.out);
            if (nodeSource.type == NodeType.event)
              link.out = (nodeSource as Event).event;
          });

          // if the initialized graph is the root graph
          console.log('this.targetVariable ', this.targetVariable.toString());
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

  @Input() disabledInspecteur: boolean = false;

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

  @Output() updateNode = new EventEmitter<string>();
  @Output() deleteNode = new EventEmitter<string>();

  @Output() updateLink = new EventEmitter<string>();
  @Output() deleteLink = new EventEmitter<string>();
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
    console.log('initCurves');
    this.curves = [];
    this.targetVariable.forEach((variable, index) => {
      let curve = new Curve(
        variable.name,
        this.duration,
        variable,
        variable.color
      );
      this.curves.push(curve);
      console.log('this.modele');
      console.log(this.modele);

      curve.calculCurve(structuredClone(this.modele));
    });

    this.newCurve.emit(this.curves);
  }

  initTrendsEventsRecursive(graph: Graph) {
    graph.nodes.forEach((node, i) => {
      switch (Node.getType(node)) {
        case EventType.action:
          node['template'] = Action.getActionByID((node as Event).event);
          this.events.push(node as Event);
          break;
        case EventType.bio:
          node['template'] = BioEvent.getBioEventByID((node as Event).event);
          this.events.push(node as Event);
          break;
        case NodeType.trend:
          this.trends.push(node as Trend);
          break;
        case NodeType.graph:
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
        graphTemplate.links.map((link: Link) => {
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
      this.deleteNode.emit(idNodeToDelete)
    } else {
      let node = event[0] as Node;
      this.updateNode.emit(node.id);

      if (node.type == NodeType.event) {
        let oldEvent = (node as Event).template.id;

        // update template
        (node as Event).template = Action.getActionByID((node as Event).event);

        this.modele.graph.links.forEach((link) => {
          if (link.in == oldEvent) link.in = (node as Event).event;
          if (link.out == oldEvent) link.out = (node as Event).event;
        });
      }
    }
    this.updateCurve();
    this.modele.graph = structuredClone(this.modele.graph);
    this.newChange.emit(true);
  }

  updateLinks(event) {
    let idLink = event[0].id;
    if (event[0].delete) {
      this.deleteLink.emit(idLink)
    }
    else{
      this.updateLink.emit(idLink)
    }
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
}
