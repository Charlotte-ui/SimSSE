import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Trend, Event, Node, Link, Graph, BioEvent, Action, NodeType,EventType } from '../../core/models/node';
import { VariablePhysio, VariablePhysioInstance } from '../../core/models/variablePhysio';
import { NodeDialogComponent } from './editeur-graphe-nodal/node-dialog/node-dialog.component';
import { Target } from '@angular/compiler';
import { RegleService } from '../../core/services/regle.service';
import { NodeService } from '../../core/services/node.service';
import { GraphDialogComponent } from './graph-dialog/graph-dialog.component';
import { Curve } from './scene/scene.component';
import { retry } from 'rxjs';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less']
})
export class EditeurComponent implements OnInit {

  // affichage dynamic des boites retractable
  barreOutilsOpened:boolean;
  inspecteurOpened:boolean;

  _targetVariable!: VariablePhysioInstance[];
  _graph: Graph;

  get targetVariable(): VariablePhysioInstance[] {
    return this._targetVariable;
  }
  @Input() set targetVariable(value: VariablePhysioInstance[]) {
    if (value) { // if value isnt undefined
      this._targetVariable = value;
      this.initCurves();
    }
  }

  get graph(): Graph {
    return this._graph;
  }
  @Input() set graph(value: Graph) {
    if (value) { // if value isnt undefined
      this._graph = value;
      this.events = new Array<[Event,number,number]>();
      this.trends = [];
      this.initTrendsEventsRecursive(value)
      if (this.targetVariable) this.initCurves();
    }
  }



  @Input() duration: number=100;




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
  events:[Event,number,number][];

  /**
   * courbes des data simulées
   */
  curves:Curve[];


  constructor(public dialog: MatDialog, public reglesService: RegleService, public nodeService: NodeService) { }

  ngOnInit(): void {

    this.reglesService.getBioEvents().subscribe(
      (response) => {
        this.allBioevents = response as BioEvent[];
      }
    );

    this.reglesService.getActions().subscribe(
      (response) => {
        this.allActions = response as Action[];
      }
    );

    this.reglesService.getActions().subscribe(
      (response) => {
        this.allActions = response as Action[];
      }
    );

    this.nodeService.getGraphGabarit().subscribe(
      (response) => {
        this.allGraphs = response;
      }
    );

  }

  /**
   * initialize all curves
   */
  initCurves(){
    this.curves = [];
    this.targetVariable.forEach((variable,index) => {
      this.curves.push({
        nom:variable.name,
        values:[],
        currentMax:0
      })
      this.calculCurve(this.duration,variable,this.curves[index])
    });
  }


  initTrendsEventsRecursive(graph:Graph){
    //console.log("initTrendsEventsRecursive")

    graph.nodes.forEach((node, i) => {
     // console.log(node)
      switch (node.type) {
        case 'event':
          this.events.push([node as Event, i,Number(graph.id)]); // if the node is an event TODO i is redandant with id ?
          break
        case 'trend':
          this.trends.push(node as Trend);
          break
        case 'graph':
          this.initTrendsEventsRecursive(node as Graph)
          break
      }
    });
  }


  addElement(element: string) {
    let indice = this.graph.nodes.length;
    let x = 50; // l'element est ajouter au milieu
    let y = 50;

    switch (element) {
      case 'link':
        return this.createLink();
      case 'bioevent':
        let bioevent = {
          id: indice.toString(),
          x: x,
          y: y,
          type: NodeType.event,
          typeEvent:EventType.bio,
          event: ''
        } as Event
        return this.createNode(bioevent,this.allBioevents);
      case 'action':
        let action = {
          id: indice.toString(),
          x: x,
          y: y,
          type: NodeType.event,
          typeEvent:EventType.action,
          event: undefined
        } as Event
        return this.createNode(action,this.allActions);
      case 'trend':
        let trend = {
          id: indice.toString(),
          name: 'Tendance ' + indice,
          x: x,
          y: y,
          type: element,
          cible: undefined,
          pente: -1
        } as Trend
        return this.createNode(trend,this.targetVariable);
      case 'group':
        let group = {
          id: indice.toString(),
          name: 'Groupe ' + indice,
          x: x,
          y: y,
          type: NodeType.graph,
          gabarit:undefined,
          links: undefined,
          nodes:undefined,
          state:false,
        } as Graph
        return this.createNode(group,this.allGraphs);
    }
  }

  createNode(newNode: Node,liste:any[]) {
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: [newNode, liste,"Ajouter"],
    });

    dialogRef.afterClosed().subscribe((result:Node) => {
      if (result) {
        if (result.type == NodeType.graph) this.initGroup(result as Graph)
        this.graph.nodes.push(result)
        this.graph = structuredClone(this.graph);// TODO force change detection by forcing the value reference update
      }
    });
  }

  createLink() {
    let index = this.graph.links.length;
    let link: Link = { id: index.toString(), source: undefined, target: undefined, type: "link", start: true };

    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: [link, this.graph.nodes,"Ajouter"],
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.graph.links.push(result);
        this.graph = structuredClone(this.graph);// TODO force change detection by forcing the value reference update
        this.initCurves()
        this.curves = [...this.curves]
      }
    });
  }

  initGroup(group:Graph) {
    group.links = this.allGraphs[Number(group.gabarit)].links;
    group.nodes = this.allGraphs[Number(group.gabarit)].nodes;
  }

  updateNodes(event) {
    //let index = Number(event[1])
    if (event[0] == "delete"){
      this.initCurves()
    }
    else{
      let node = event[0] as Node;
      this.graph.nodes[event[1]] = node;
      if (node.type == 'trend') { // si seule une trend est modifiée on ne change qu'une courbe, sinon tout le graph change
        let trend = node as Trend; // TODO ; pour le moment pas util à cause du this.graph = structuredClone(this.graph);, nécessaire pour l'emplacement des nodes
        let variable = this.getVariableByName(trend.cible)
        this.calculCurve(this.duration, this.targetVariable[variable.id],this.curves[variable.id])
      }
      else this.initCurves()
    }
    this.graph = structuredClone(this.graph);
    this.curves = [...this.curves]

  }

  updateLinks(event) {
   // let index = Number(event[1])

    this.initCurves()
    this.curves = [...this.curves]

  }

  updateTriggers(event) {
    // let index = Number(event[1])

     this.initCurves()
     this.curves = [...this.curves]

   }

  getVariableByName(name:string):VariablePhysioInstance{

    let res = undefined;

    this.targetVariable.forEach(variable => {
      if (variable.name == name) res = variable;
    });

    return res;

  }

  updateVariables(event) {
    let index = Number(event[1])
    let variable = event[0] as VariablePhysioInstance;
    this.targetVariable[index] = variable
    // comme targetVariable est un tableau donc un objet, changer la valeur d'un élement de modifie pas le pointeur
    // et donc le @Input: targetVariable du composant Scene n'est pas trigger
    // on peut utiliser this.targetVariable = [...this.targetVariable] pour forcer l'update
    // mais alors toutes les courbes sont recalculées
    // pour ne recalculer qu'une seule courbe, on utilise la variable varToUpdate
    // ce qui trigger le @Input: varToUpdate du composant Scene

    this.targetVariable[index] = variable;
    this.calculCurve(this.duration, this.targetVariable[index],this.curves[index]);
    this.curves = [...this.curves] ;

  }

  /**
   * set a node active or inactive at time t
   * @param t
   */
  updateNodesStates(t:number){
    this.updateNodeStatesRecursive(this.graph.triggeredEvents,this.graph,t)
  }

  /**
   * recursive methode pour modifer les états des noeuds caché en profondeur dans les graphs
   * @param graph
   * @param t
   */
  updateNodeStatesRecursive(triggeredEvents:[number,string][],graph:Graph,t:number){
    triggeredEvents.forEach(event => {
      if (event[0] == t) { // event trigger at time t
        let nameEvent = event[1];
        graph.links.forEach(link => {
          if (nameEvent == link.source){
            let nodeTrigger = graph.nodes[Number(link.target)];
            nodeTrigger.state = link.start;
            if(nodeTrigger.type == NodeType.graph) {
              if (nodeTrigger.state) this.updateNodeStatesRecursive(triggeredEvents,nodeTrigger as Graph,t) // si le node est un graph, on updte les états des nodes internes
              else this.setAllNodesStatesToFalse(nodeTrigger as Graph) // desctivate all nodes states
            }
          }
        })
      }
    })

    //update all the graph who could have been triggered internaly
    graph.nodes.forEach(node =>{
      if (node.type == NodeType.graph && node.state) this.updateNodeStatesRecursive(triggeredEvents,node as Graph,t)
    })
  }


  setAllNodesStatesToFalse(graph:Graph){
    graph.nodes.forEach(node =>
      {
        node.state = false;
        if (node.type == NodeType.graph) this.setAllNodesStatesToFalse(node as Graph)
      })
  }


  // tools

  /**
   * determinate the trend for the variable at time i
   * depend of the current (i) states of the nodes
   * @param variable
   * @param i
   * @returns
   */
  calculTrend(variable:VariablePhysioInstance){
   // console.log("calculTrend "+variable.name)
    let trend = 0;
     // s'il y a plusieur trend d'actives sur une même variable en même temps, on leur appliquent une fonction pour réduire à une trend
    let trends = this.calculTrendRecursive(variable,this.graph.nodes);
    if(trends.length>0) trend = this.reduceTrends(trends)
  //  console.log(trends)
  //  console.log(trend)

    return trend;
  }

  /**
 * recursive methode qui va chercher les trends en profondeur dans les graphs
 * @param variable
 * @param i
 * @returns
 */
  private calculTrendRecursive(variable:VariablePhysioInstance,nodes:Node[]){
   // console.log("calculTrendRecursive "+variable.name)
    let trends:number[] = []; // s'il y a plusieur trend d'actives sur une même variable en même temps, on leur appliquent une fonction pour réduire à une trend
    nodes.forEach(node => {
      if(node.state){ // si le node est actif
        if (node.type == "trend" && (node as Trend).cible == variable.name ) { // si le node est une trend
          trends.push(Number((node as Trend).pente))
        }
        if (node.type == "graph") { // si le node est un graph

          let graphTrends = this.calculTrendRecursive(variable,(node as Graph).nodes);
          trends=trends.concat(graphTrends);
        }
      }
    });
    return trends;
  }

  reduceTrends(trends:number[]):number{
    return trends.reduce((x,y) => x+y) // /array.length // somme des trend
  }

  isNodeTrigger(nodeTriggers,node):boolean|undefined{
    let res = undefined;
    nodeTriggers.forEach(nodeTrigger => {
      if (nodeTrigger[0] == node.id) res = nodeTrigger[1];// res is true si le trigger est un start, false si c'est un stop
      }
    );
    return res;
  }

  /**
   * generate the curve
   * @param size
   * @param variable
   * @returns
   */
  private calculCurve(size: number, variable: VariablePhysioInstance, curve:Curve) {
    let trend = 0; //by default there is no trend, the curve is constante
    let prevValue = variable.cible; // at t=0 the previous value is the target

    curve.values = [];
    curve.currentMax = 0;

    for (let i = 0; i < size; i++) {
      this.updateNodesStates(i); // each minute that pass we updates the states of the nodes
      if(this.graph.nodes) trend = this.calculTrend(variable); // si les nodes sont initialisés, ont les utilisent pour déterminer les changements de trend

      if (i > 0) prevValue = curve.values[i - 1][1]

      let newValue = prevValue + this.gaussianRandom(0, variable.rand) + trend;
      //let newValue = variable.cible + i*trend + this.gaussianRandom(0, variable.rand) ;

      if (newValue > variable.max) newValue = variable.max;
      if (newValue < variable.min) newValue = variable.min;
      if (curve.currentMax < newValue) curve.currentMax = newValue;

      curve.values.push([i, newValue])
    }
  }

  // Standard Normal variate using Box-Muller transform.
  private gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }

  private getEventAtTime(time: number): number[] | undefined {
    let result = undefined;
    this.graph.triggeredEvents.forEach(event => {
      if (event[0] == time) result = event;
    });
    return result;
  }

  private getTrendsFromEvent(event: string): any[] {
    let trends = [];
    this.graph.links.forEach(link => {
      if (event == link.source) trends.push([link.target, link.start]);
    });
    return trends;
  }

}
