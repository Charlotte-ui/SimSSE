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



  barreOutilsOpened:boolean;
  inspecteurOpened:boolean;



  _targetVariable!: VariablePhysioInstance[];
  _nodes!: Node[];


  get targetVariable(): VariablePhysioInstance[] {
    return this._targetVariable;
  }
  @Input() set targetVariable(value: VariablePhysioInstance[]) {
    if (value) { // if value isnt undefined
      this._targetVariable = value;
      console.log("set targetVariable");
      console.log(value);
      this.initCurves();

    }
  }

  get nodes(): Node[] {
    return this._nodes;
  }
  @Input() set nodes(value: Node[]) {
    if (value) { // if value isnt undefined
      this._nodes = value;
      this.events = [];
      this.trends = [];
      this.nodes.forEach((node, i) => {
        if (node.type == "event") this.events.push([node as Event, i]); // if the node is an event TODO i is redandant with id ?
        if (node.type == "trend") this.trends.push(node as Trend);

      });

      if (this.targetVariable) this.initCurves();
    }
  }

  @Input() links: Link[];
  @Input() duration: number=100;

  triggeredEvents = [[0, 0], [50, 3]]
  allBioevents!: BioEvent[];
  allActions!: Action[];
  allGraphs!: Graph[];


  /**
   * all trends is the nodes and theirs ids
   */
  trends!: Trend[];

  /**
   * all events is the nodes and theirs ids
   */
  events:(Event|number)[][];

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

  addElement(element: string) {
    let indice = this.nodes.length;
    let x = 50; // l'element est ajouter au milieu
    let y = 50;

    switch (element) {
      case 'link':
        return this.createLink();
      case 'bioevent':
        let bioevent = {
          id: indice.toString(),
          name: 'Évenement ' + indice,
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
          name: 'Action ' + indice,
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
        console.log(result);
        if (result.type == NodeType.graph) this.initGroup(result as Graph)
        this.nodes.push(result)
        this.nodes = [...this.nodes] // force change detection by forcing the value reference update
        console.log("node create");
        console.log(result);
      }
    });
  }

  createLink() {
    let index = this.links.length;
    let link: Link = { id: index.toString(), source: undefined, target: undefined, type: "link", start: true };

    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: [link, this.nodes,"Ajouter"],
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

      if (result) {
        console.log(result);
        this.links.push(result);
        this.links = [...this.links] // force change detection by forcing the value reference update
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
      console.log("new x" + node.x)
      console.log("new y" + node.y)
      this.nodes[event[1]] = node;
      console.log(this.nodes[event[1]]);

      if (node.type == 'trend') { // si seule une trend est modifiée on ne change qu'une courbe, sinon tout le graph change
        let trend = node as Trend; // TODO ; pour le moment pas util à cause du this.nodes = [...this.nodes], nécessaire pour l'emplacement des nodes
        let variable = this.getVariableByName(trend.cible)
        this.calculCurve(this.duration, this.targetVariable[variable.id],this.curves[variable.id])
      }
      else this.initCurves()
    }
    this.nodes = [...this.nodes]
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

    this.triggeredEvents.forEach(event => {
      if (event[0] == t) { // event trigger at time t
        let idEvent = event[1];
        this.links.forEach(link => {
          if (idEvent == link.source){
            let nodeTrigger = this.nodes[link.target];
            nodeTrigger.state = link.start;
          }
        })
      }
    })

/*
    let event = this.getEventAtTime(t);
    let nodeTriggers = this.getTrendsFromEvent(event[1]); */

  }

  // tools

  calculTrend(variable:VariablePhysioInstance,i:number){
    let trend = 0;
    let trends:number[] = [];

    this.nodes.forEach(node => {
      if (node.type == "trend" && (node as Trend).cible == variable.name && node.state) { // state = true => node active
        trends.push(Number((node as Trend).pente))
      }
    });


    /*   console.log("trends")
      console.log(variable)

      console.log(trends)
 */
      if(trends.length>0) trend = trends.reduce((x,y) => x+y) // /array.length // somme des trend

      return trend;
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
   * generate the data
   * @param size
   * @param variable
   * @returns
   */
  private calculCurve(size: number, variable: VariablePhysioInstance, curve:Curve) {

  /*   console.log("calculCurve ")
    console.log(variable) */
    curve.values = [];

    let trend = 0;
    curve.currentMax = 0;
    let prevValue = variable.cible;
    for (let i = 0; i < size; i++) {

      this.updateNodesStates(i);

      if(this.nodes) trend = this.calculTrend(variable,i); // si les nodes sont initialisés, ont les utilisent pour déterminer les changements de trend

      if (i > 0) prevValue = curve.values[i - 1][1]

      let newValue = prevValue + this.gaussianRandom(0, variable.rand) + trend;
      //let newValue = variable.cible + i*trend + this.gaussianRandom(0, variable.rand) ;

      if (newValue > variable.max) newValue = variable.max;
      if (newValue < variable.min) newValue = variable.min;
      if (curve.currentMax < newValue) curve.currentMax = newValue;

      curve.values.push([i, newValue])
    }
    console.log(curve)
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
    this.triggeredEvents.forEach(event => {
      if (event[0] == time) result = event;
    });
    return result;
  }

  private getTrendsFromEvent(event: number): any[] {
    let trends = [];
    this.links.forEach(link => {
      if (event == link.source) trends.push([link.target, link.start]);
    });
    return trends;
  }

}
