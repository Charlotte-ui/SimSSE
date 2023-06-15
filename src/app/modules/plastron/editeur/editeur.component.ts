import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Trend,
  Event,
  Node,
  Link,
  Graph,
  NodeType,
  EventType,
} from '../../../models/vertex/node';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../../models/vertex/variablePhysio';
import { RegleService } from '../../../services/regle.service';
import { NodeService } from '../../../services/node.service';
import { Observable, concat, forkJoin, map, of, switchMap, zipAll } from 'rxjs';
import { Modele, ModeleSaverArrays } from '../../../models/vertex/modele';
import { Curve } from '../../../functions/curve';
import { ModeleService } from '../../../services/modele.service';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { Template } from 'src/app/models/interfaces/templatable';
import { Trigger } from 'src/app/models/trigger';
import {
  getElementByChamp,
  pushWithoutDuplicateByChamp,
} from 'src/app/functions/tools';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less'],
})
export class EditeurComponent implements OnInit {
  // affichage dynamic des boites retractable
  barreOutilsOpened: boolean;
  inspecteurOpened: boolean;
  graphInitialized: boolean = false;
  curvesInitialized: boolean = false;

  _targetVariable!: VariablePhysioInstance[];

  get targetVariable(): VariablePhysioInstance[] {
    return this._targetVariable;
  }
  @Input() set targetVariable(value: VariablePhysioInstance[]) {
    if (value) {
      this._targetVariable = value;
      if (this.graphInitialized) this.initCurves();
    }
  }

  _modele!: Modele;
  get modele(): Modele {
    return this._modele;
  }
  @Input() set modele(value: Modele) {
    if (value) {
      console.log('editeur modele ', value);
      this._modele = value;
      this.modelService
        .getGraph(this.modele.id)
        .pipe(
          switchMap((graph: Graph) => {
            this.modele.graph = graph;
            return this.initGraph(this.modele.graph);
          })
        )
        .subscribe((result: [Template[], Link[]]) => {
          this.initTemplateAndLinks(result, this.modele.graph);

          // all the trends and all the event from the graph and the nested graphs
          this.trends = [];
          this.events = [];
          this.initTrendsEventsRecursive(this.modele.graph);

          this.initSaver.emit(this.modele.initSaver())

          this.graphInitialized = true;

          // after the model graph initialization, the curves are generated
          if (this.targetVariable) {
            this.initCurves();
            this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
          }
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
  @Output() updateTrigger = new EventEmitter<Trigger>();
  @Output() deleteTrigger = new EventEmitter<Trigger>();
  @Output() updateVariable = new EventEmitter<VariablePhysioInstance>();
  @Output() initSaver = new EventEmitter<ModeleSaverArrays>();

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

    this.nodeService.getAllGraphTemplate().subscribe((response) => {
      this.allGraphs = response;
    });
  }

  /**
   * init all the nodes and links of a graph
   * recursive
   * take a graph in paramater and return a list of template to add to the nodes and a list of links to add to the graph
   * @param graph
   */
  initGraph(graph: Graph): Observable<[Template[], Link[]]> {
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
          } else if (node.type == NodeType.graph)
            return this.nodeService.getGraphTemplate(node as Graph).pipe(
              switchMap((graphTemplate: Graph) =>
                this.initGraph(graphTemplate).pipe(
                  map((result: [Template[], Link[]]) => {
                    this.initTemplateAndLinks(result, graphTemplate);
                    return graphTemplate;
                  })
                )
              )
            );
          else return of(undefined);
        });
        const requestLink = this.modelService.getGraphLinks(nodeIDArray);
        return forkJoin([concat(requestsTemplate).pipe(zipAll()), requestLink]);
      })
    );
  }

  /**
   * take a list of template, a liste of link, and a graph and bind the templates to the nodes and the links to the graph
   * @param result
   * @param graph
   */
  initTemplateAndLinks(result: [Template[], Link[]], graph: Graph) {
    // on attribiut leur template aux events et aux graph
    graph.nodes.map((node: Node, index: number) => {
      if (node['template']) node['template'] = result[0][index];
      if (node.type == NodeType.graph) {
        node['nodes'] = (result[0][index] as Graph).nodes;
        node['links'] = (result[0][index] as Graph).links;
        node['template'] = (result[0][index] as Graph).id;
      }
    });

    graph.links = result[1];

    // if the link point to an event replace the node id by the event so an all event nodes are triggered at once
/*     graph.links.map((link: Link) => {
      let nodeSource = graph.nodes.filter(
        (node: Node) => node.id === link.out
      )[0];
      if (nodeSource.type == NodeType.event)
        link.out = (nodeSource as Event).event;
    }); */
  }

  /**
   * initialize all curves
   */
  initCurves() {
    this.curves = this.targetVariable.map(
      (variable: VariablePhysioInstance) =>
        new Curve(variable.name, this.duration, variable, variable.color)
    );
    this.updateCurve();
    this.curvesInitialized = true;
    this.newCurve.emit(this.curves);
  }

  initTrendsEventsRecursive(graph: Graph) {
    graph.nodes.forEach((node: Node) => {
      switch (Node.getType(node)) {
        case EventType.action:
          node['template'] = this.allActions.filter(
            (action: Action) => action.id == (node as Event).event
          )[0];
          this.events = pushWithoutDuplicateByChamp<Event>(
            this.events,
            node as Event,
            'event'
          );
          break;
        case EventType.bio:
          node['template'] = this.allBioevents.filter(
            (bioevent: BioEvent) => bioevent.id == (node as Event).event
          )[0];
          this.events = pushWithoutDuplicateByChamp<Event>(
            this.events,
            node as Event,
            'event'
          );
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
    let graphTemplate = getElementByChamp<Graph>(
      Graph.graphs,
      'id',
      group.template.toString()
    );

    // TODO : créer de nouveaux node and links avec de nouveaux id ?

    this.initGraph(graphTemplate).subscribe((result: [Template[], Link[]]) => {
      //     group.links = structuredClone(graphTemplate.links);
      group.nodes = structuredClone(graphTemplate.nodes);
      this.initTemplateAndLinks(result, group);
      this.initTrendsEventsRecursive(group);

      this.modele.graph.nodes.push(group);
      this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
    });
  }

  // --- UPDATEURS -----------------------------------------

  /**
   * add an element, Node or Link, to the root graph
   * @param element
   */
  addElement(element: Node | Link) {
    if (element.type == NodeType.link) {
      // ADD LINK
      let indice = this.modele.graph.links.length.toString();
      (element as Link).id = indice;
      this.modele.graph.links.push(element as Link);
      this.updateLink.emit(indice);
    } else {
      // ADD NODE
      let indice = this.modele.graph.nodes.length.toString();
      element.id = indice;
      if (element.type == NodeType.event)
        this.events = pushWithoutDuplicateByChamp<Event>(
          this.events,
          element as Event,
          'event'
        );
        
      if (element.type == NodeType.graph) this.initGroup(element as Graph);
      else {
        this.modele.graph.nodes.push(element as Node);
        
        this.nodeService.updateGraph(
          this.modele.graph,
          [element.id],
          [],
          [],
          []
        ).subscribe(res=>{console.log('res',res)})

        // TODO : créer une méthode create node qui renvoit l'id du node, puis le bind avant de le renvoyer dans le xmgraph


      }
    }
    this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
    this.updateCurve();
    this.newChange.emit(true);
  }

  updateNodes(event) { // TODO ; mettre l'id de l'event dans le cas d'un event
    if (event[0].delete) {
      let ref = event[0].ref ;   
      console.log("ref ",ref)
      // delete all the links link to the deleted node
      this.modele.graph.links.forEach((link) => {
        if (link.in == ref || link.out == ref)
          this.modele.graph.links.splice(
            this.modele.graph.links.indexOf(link),
            1
          );
      });
      console.log('this.modele.graph.links ',this.modele.graph.links)
    } else {
      let node = event[0] as Node;
      this.updateNode.emit(node.id);

      if (node.type == NodeType.event) {
        let oldEvent = (node as Event).template.id;

        // update template
        (node as Event).template = getElementByChamp<Action>(
          this.allActions,
          'id',
          (node as Event).event
        );
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
      this.deleteLink.emit(idLink);
    } else {
      this.updateLink.emit(idLink);
    }
    // let index = Number(event[1])
    this.updateCurve();
    this.newChange.emit(true);
  }

  updateVariables(newVariable: VariablePhysioInstance) {
    let variable = getElementByChamp<VariablePhysioInstance>(
      this.targetVariable,
      'template',
      newVariable.template
    );
    let index = this.targetVariable.indexOf(variable);
    this.targetVariable[index] = newVariable;
    this.curves[index].variable = newVariable;
    this.curves[index].calculCurve(this.modele);
    this.curves = [...this.curves];
    this.updateVariable.emit(newVariable);
  }

  updateCurve() {
    console.log('updateCurve ',this.curves)
    console.log('updateCurve ',this.modele)
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
}
