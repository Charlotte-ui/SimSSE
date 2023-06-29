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
import { Modele } from '../../../models/vertex/modele';
import { Curve } from '../../../functions/curve';
import { ModeleService } from '../../../services/modele.service';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { Template } from 'src/app/models/interfaces/templatable';
import { Trigger } from 'src/app/models/trigger';
import {
  getElementByChamp,
  getNodeByID,
  pushWithoutDuplicateByChamp,
} from 'src/app/functions/tools';
import { ProfilService } from 'src/app/services/profil.service';

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

  // target variable of the homeostasi profil
  _targetVariable!: VariablePhysioInstance[];

  draw: any[];

  get targetVariable(): VariablePhysioInstance[] {
    return this._targetVariable;
  }
  @Input() set targetVariable(value: VariablePhysioInstance[]) {
    if (value) {
      this._targetVariable = value;
      if (this.graphInitialized) this.initCurves();
    }
  }

  /**
   * all the variables templates
   */
  @Input() variablesTemplate: VariablePhysioTemplate[];

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
        .pipe(
          switchMap((result: [Template[], Link[]]) => {
            this.initTemplateAndLinks(result, this.modele.graph);
            return this.initTrigger().pipe(map(() => result));
          })
        )

        .subscribe((result: [Template[], Link[]]) => {
          // all the trends and all the event from the graph and the nested graphs
          this.trends = [];
          this.actions = [];
          this.bioevents = [];
          this.initTrendsEventsRecursive(this.modele.graph);
          console.log('graph initialiezs ', this.graphInitialized);
          this.graphInitialized = true;
          // after the model graph initialization, the curves are generated
          if (this.targetVariable) {
            this.initCurves();
            this.draw = new Array(); // force change detection by forcing the value reference update
          }
        });
    }
  }

  // in a modele vue, the inspecteur is disabled
  @Input() disabledInspecteur: boolean = false;

  /**
   * duration of the simulation (min), 100 min by default (form modele)
   */
  @Input() duration: number = 100;

  /**
   * all currents trends in the nodes
   */
  trends!: Trend[];

  /**
   * all currents actions in the nodes
   */
  actions: Event[];

  /**
   * all currents bioevents in the nodes
   */
  bioevents: Event[];

  /**
   * courbes des data simulées
   */
  curves: Map<string, Curve>;

  /**
   * préviens le plastron quand un changement a besoin d'être enregistré
   */
  @Output() newCurve = new EventEmitter<Map<string, Curve>>();

  constructor(
    public dialog: MatDialog,
    public reglesService: RegleService,
    public nodeService: NodeService,
    private modelService: ModeleService,
    private profilService: ProfilService
  ) {
    this.curves = new Map<string, Curve>();
  }

  // --- INITIALISATEURS -----------------------------------------

  ngOnInit(): void {
    this.reglesService.getBioEvents().subscribe();
    this.reglesService.getActions().subscribe();
    this.reglesService.getCategories().subscribe();
    this.nodeService.getAllGraphTemplate().subscribe();
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

        if (nodes.length > 0) {
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
              return this.initGraph(node as Graph).pipe(
                map((result: [Template[], Link[]]) => {
                  this.initTemplateAndLinks(result, node as Graph);
                  return node as Graph;
                })
              );
            /*             this.nodeService.getGraphTemplate(node as Graph).pipe(
              switchMap((graphTemplate: Graph) =>
                this.initGraph(graphTemplate).pipe(
                  map((result: [Template[], Link[]]) => {
                    this.initTemplateAndLinks(result, graphTemplate);
                    return graphTemplate;
                  })
                )
              )
            ); */ else return of(undefined);
          });
          const requestLink = this.modelService.getGraphLinks(nodeIDArray);
          return forkJoin([
            concat(requestsTemplate).pipe(zipAll()),
            requestLink,
          ]);
        } else return of(undefined);
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
    if (result) {
      graph.nodes.map((node: Node, index: number) => {
        if (node['template']) node['template'] = result[0][index];
        if (node.type == NodeType.graph) {
          node['nodes'] = (result[0][index] as Graph).nodes;
          node['links'] = (result[0][index] as Graph).links;
          node['template'] = (result[0][index] as Graph).id;
        }
      });
      graph.links = result[1];
    }
  }

  /**
   * initialize all curves
   */
  initCurves() {
    this.targetVariable.map((variable: VariablePhysioInstance) => {
      this.curves.set(
        variable.template,
        new Curve(variable.name, this.duration, variable, variable.color)
      );
    });
    this.updateCurve();
    this.curvesInitialized = true;
    this.newCurve.emit(this.curves);
  }

  initTrendsEventsRecursive(graph: Graph) {
    graph.nodes.forEach((node: Node) => {
      switch (Node.getType(node)) {
        case EventType.action:
          node['template'] = Action.getActionById((node as Event).event);
          this.addAction(node as Event);
          break;
        case EventType.bio:
          node['template'] = BioEvent.getBioEventById((node as Event).event);
          this.addBioEvent(node as Event);
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

  initTrigger() {
    return this.modelService.getTrigger(this.modele.id).pipe(
      map((triggers: Trigger[]) => {
        // bind name to trigger
        triggers.map((trigger: Trigger) => {
          let node = getNodeByID(this.modele.graph, trigger.in);
          console.log('node trig ', node);
          trigger.name = Node.getName(node);
        });

        this.modele.triggeredEvents = triggers;

        console.log(
          'this.modele.triggeredEvents ',
          this.modele.triggeredEvents
        );
        console.log('this.modele.graph.nodes ', this.modele.graph.nodes);
      })
    );
  }

  addAction(event: Event) {
    this.actions = pushWithoutDuplicateByChamp<Event>(
      this.actions,
      event,
      'event'
    );
  }

  addBioEvent(event: Event) {
    this.bioevents = pushWithoutDuplicateByChamp<Event>(
      this.bioevents,
      event,
      'event'
    );
  }

  /**
   * initialize a group to add to the root graph
   * make a copy of the graph template
   * add this copy to the root graph
   * @param group 
   */
  initGroup(group: Graph) {
    let graphTemplate = Graph.getGraphById(group.template.toString());

    console.log('init groupe ', graphTemplate);
    // TODO : créer de nouveaux node and links avec de nouveaux id ?

    this.initGraph(graphTemplate).subscribe((result: [Template[], Link[]]) => {
      // group.links = structuredClone(graphTemplate.links);
      group.nodes = structuredClone(graphTemplate.nodes);
      this.initTemplateAndLinks(result, group);
      this.initTrendsEventsRecursive(group);
      this.nodeService
        .addNodeToGraph(group, this.modele.graph)
        .subscribe((node: Node) => {
          console.log('group ', node);
          this.modele.graph.nodes.push(node);
          console.log('modele.graph.nodes ', this.modele.graph.nodes);
          this.draw = new Array(); //  force change detection by forcing the value reference update
        });
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
      this.nodeService
        .createLink(
          (element as Link).in,
          (element as Link).out,
          (element as Link).trigger
        )
        .subscribe((link: Link) => {
          element.id = link.id;
          this.modele.graph.links.push(element as Link);
          this.updateCurve();
        });
    } else {
      // ADD NODE
      let indice = this.modele.graph.nodes.length.toString();
      element.id = indice;
      if (Node.getType(element) === EventType.action)
        this.addAction(element as Event);
      if (Node.getType(element) === EventType.bio)
        this.addBioEvent(element as Event);

      // ADD GROUP
      if (element.type == NodeType.graph) this.initGroup(element as Graph);
      else {
        this.nodeService
          .addNodeToGraph(element as Node, this.modele.graph)
          .subscribe((node: Node) => {
            element.id = node.id;
            this.modele.graph.nodes.push(element as Node);
            this.modele.graph = structuredClone(this.modele.graph); // TODO force change detection by forcing the value reference update
            this.updateCurve();
          });
      }
    }
  }

  updateGraph(node) {
    console.log('updateGraph ', this.modele);
    if (node && Node.getType(node) === EventType.action)
      this.addAction(node as Event);
    this.updateCurve();
  }

  updateVariables(newVariable: VariablePhysioInstance) {
    this.curves.get(newVariable.template).variable = newVariable;
    this.curves.get(newVariable.template).calculCurve(this.modele);
    this.draw = new Array();
    this.profilService.updateVariable(newVariable).subscribe();
  }

  updateCurve() {
    console.log('updateCurve ', this.curves);
    console.log('updateCurve ', this.modele);
    this.curves.forEach((curve) => {
      // clean the triggereds of all the curves-genereted triggerd
      this.modele.triggeredEvents = this.modele.triggeredEvents.filter(
        (trigger) => trigger.editable
      );

      let newtriggered = curve.calculCurve(structuredClone(this.modele));
      this.modele.triggeredEvents = newtriggered;
    });
    this.draw = new Array();
  }
}
