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
  LinkType,
} from '../../../models/vertex/node';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../../../models/vertex/variablePhysio';
import { RegleService } from '../../../services/regle.service';
import { NodeService } from '../../../services/node.service';
import {
  Observable,
  concat,
  concatMap,
  forkJoin,
  from,
  map,
  of,
  reduce,
  switchMap,
  zipAll,
} from 'rxjs';
import { Modele } from '../../../models/vertex/modele';
import { Curve } from '../../../functions/curve';
import { ModeleService } from '../../../services/modele.service';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { Template } from 'src/app/models/interfaces/templatable';
import { Trigger } from 'src/app/models/trigger';
import {
  getElementByChamp,
  getElementByChampMap,
  getNodeByID,
  pushWithoutDuplicateByChamp,
} from 'src/app/functions/tools';
import { ProfilService } from 'src/app/services/profil.service';
import { Button } from 'src/app/functions/display';
import { GraphService } from 'src/app/services/graph.service';

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
        .getGraphModele(this.modele.id)
        .pipe(
          switchMap((graph: Graph) => {
            this.modele.graph = graph;
            return this.graphService.initGraph(this.modele.graph);
          })
        )
        .pipe(
          switchMap((result: [Template[], Link[]]) => {
            this.graphService.initTemplateAndLinks(result, this.modele.graph);
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
    private profilService: ProfilService,
    private graphService: GraphService
  ) {
    this.curves = new Map<string, Curve>();
  }

  // --- INITIALISATEURS -----------------------------------------

  ngOnInit(): void {
    this.reglesService.getBioEvents().subscribe();
    this.reglesService.getActions().subscribe();
    this.reglesService.getCategories().subscribe();
    this.graphService
      .getAllGraphTemplate()
      .pipe(switchMap((res) => Graph.getListByCategory(this.graphService)))
      .subscribe((graphByCategories) => {
        Graph.graphsByCategories = graphByCategories;
      });
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
          node['template'] = Action.actions.get((node as Event).event);
          this.addAction(node as Event);
          break;
        case EventType.bio:
          node['template'] = BioEvent.bioevents.get((node as Event).event);
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
          trigger.name = Node.getName(node);
          trigger.color = Button.getButtonByType(Node.getType(node)).color;
        });

        this.modele.triggeredEvents = new Map(
          triggers.map((trigger) => [trigger.id, trigger])
        );

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
    let graphTemplate = Graph.graphs.get(group.template.toString());

    console.log('init groupe ', graphTemplate);
    // TODO : créer de nouveaux node and links avec de nouveaux id ?

    this.graphService
      .initGraph(graphTemplate)
      .subscribe((result: [Template[], Link[]]) => {
        // group.links = structuredClone(graphTemplate.links);
        group.nodes = structuredClone(graphTemplate.nodes);
        this.graphService.initTemplateAndLinks(result, group);
        this.initTrendsEventsRecursive(group);
        this.graphService
          .addNodeToGraph(group, this.modele.graph)
          .subscribe((node: Node) => {
            console.log('group ', node);
            this.modele.graph.nodes.set(node.id, node);
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
      let indice = this.modele.graph.links.size.toString();
      (element as Link).id = indice;
      this.nodeService
        .createLink(
          (element as Link).in,
          (element as Link).out,
          (element as Link).trigger
        )
        .subscribe((link: Link) => {
          element.id = link.id;
          this.modele.graph.links.set(element.id, element as Link);
          this.updateCurve();
        });
    } else {
      // ADD NODE
      let indice = this.modele.graph.nodes.size.toString();
      element.id = indice;
      if (Node.getType(element) === EventType.action)
        this.addAction(element as Event);
      if (Node.getType(element) === EventType.bio)
        this.addBioEvent(element as Event);

      // ADD GROUP NODE
      if (element.type == NodeType.graph) this.initGroup(element as Graph);
      else {
        // ADD CLASSIC NODE
        this.graphService
          .addNodeToGraph(element as Node, this.modele.graph)
          .subscribe((node: Node) => {
            element.id = node.id;
            this.modele.graph.nodes.set(element.id, element as Node);
            this.updateCurve();
          });
      }
    }
  }

  /**
   * add some trends and link them to the start event of the graph
   * @param element
   */
  addStartTrends(trends: Trend[]) {
    console.log('addStartTrends');
    let startNode = getElementByChampMap<Node>(
      this.modele.graph.nodes,
      'event',
      EventType.start
    );
    console.log('startNode ', startNode);

    let requestsNode = trends.map((trend: Trend) =>
      this.graphService.addNodeToGraph(trend, this.modele.graph).pipe(
        map((node: Node) => {
          trend.id = node.id;
          this.modele.graph.nodes.set(trend.id, trend);
          return trend;
        })
      )
    );

    from(requestsNode)
      .pipe(
        concatMap((request: Observable<Trend>) => request),
        reduce((acc, cur) => [...acc, cur], []),
        switchMap((trends: Trend[]) => {
          console.log('trends ', trends);

          let requestsLink = trends.map((trend: Trend) =>
            this.nodeService
              .createLink(trend.id, startNode.id, LinkType.start)
              .pipe(
                map((link: Link) => {
                  console.log('trend ', trend, ' link ', link);
                  this.modele.graph.links.set(link.id, link);
                })
              )
          );

          return from(requestsLink).pipe(
            concatMap((request: Observable<any>) => request),
            reduce((acc, cur) => [...acc, cur], []),
            map((res) => {
              console.log('res requestsLink ', res);

              this.updateCurve();
            })
          );
        })
      )
      .subscribe();

    // element.id = indice;
  }

  updateGraph(node) {
    console.log('updateGraph ', this.modele);
    if (node && Node.getType(node) === EventType.action)
      this.addAction(node as Event);
    this.updateCurve();
  }

  updateVariables(newVariable: VariablePhysioInstance) {
    this.curves.get(newVariable.template).variable = newVariable;
    Curve.calculCurves(this.modele, this.curves, this.duration);
    this.draw = new Array();
    this.profilService.updateVariable(newVariable).subscribe();
  }

  updateCurve() {
    console.log('updateCurve');

    // clean the triggereds of all the curves-genereted triggerd
    this.modele.triggeredEvents = new Map(
      [...this.modele.triggeredEvents].filter(
        ([key, trigger]) => trigger.editable
      )
    );

    console.log(
      'clean this.modele.triggeredEvents ',
      structuredClone(this.modele.triggeredEvents)
    );

    let newtriggered = Curve.calculCurves(
      structuredClone(this.modele),
      this.curves,
      this.duration
    );
    console.log('newtriggered ', newtriggered);
    this.modele.triggeredEvents = newtriggered;
    console.log('newcurves ', this.curves);
    this.draw = new Array();
  }
}
