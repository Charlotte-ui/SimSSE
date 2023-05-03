import { Collection } from "../services/firebase.service";
import { Nameable } from "./nameable";
import { Vertex } from "./vertex";


export enum NodeType {
  trend = "trend",
  event = "event",
  graph = "graph",
  link = "link",
  timer = "timer"
}

export enum EventType {
  start = "eventstart",
  bio = "eventbio",
  action = "eventaction"
}

export abstract class Node extends Vertex implements Nameable{
    x: number;
    y: number;
    type: NodeType;
    state: boolean; // activate or not activate

    constructor(object?:any) {
      super(object);
      this.x = object?.x?object.x:50;
      this.y = object?.y?object.y:50;
      this.type = object?.type?object.type:undefined;
      this.state = false ;
    }
    
  abstract getName();

}

export class Trend extends Node{

    cible: string;
    pente: number;
    name: string;

    constructor(object?:any) {
      super(object);
      this.name = (object?.name)?object.name:'Tendance';
      this.cible = (object?.cible)?object.cible:undefined;
      this.pente = (object?.pente)?object.pente:0;
    }


    override getName(): string {
      return this.name;
    }
}

export  class Event extends Node{

    event: string;
    typeEvent:string;

    constructor(object?:any) {
      super(object);
      this.event = (object?.event)?object.event:undefined;
      this.typeEvent = (object?.typeEvent)?object.typeEvent:undefined;
    }

    override getName(): string {
      return this.event;
    }

}

export class Link implements Collection{
    id: string;
    type: string;
    source: string|number;
    target: number;
    start:boolean;

    constructor(id:string,source?:string|number,target?:number,start?:boolean) {
      this.id = id;
      this.source = (source)?source:undefined;
      this.target = (target)?target:undefined;
      this.type = NodeType.link;
      this.start = (start !== undefined)?start:true ;
    }
}

export class Graph extends Node{

  name: string;
  nodes: Node[];
  links: Link[];
  gabarit:string|boolean; // ref vers le graph gabarit si instance, true si gabarit
  root:boolean; // le graph est a la racine du modele (true) ou fait partie d'un autre graph (false)


  constructor(object?:any) {
    object["type"] = NodeType.graph;
    super(object);
    this.name = (object?.name)?object.name:'Groupe';
    this.nodes =(object?.nodes)?object.nodes: undefined;
    this.links = (object?.links)?object.links:undefined;
    this.gabarit = (object?.gabarit)?object.gabarit:false;
    this.root = (object?.root)?object.root:false;
  }

  override getName(): string {
    return this.name;
  }

}

export class Timer extends Node{
  name:string;
  duration:number; // total duration of the timer
  counter:number;  // curent time

  constructor(object?:any) {
    super(object);
    this.name = "Timer "+this.id; // TODO : pq le getName() ne fonctionne pas ?
    this.duration = 0;
    this.counter = 0
  }

  public override getName(): string {
    return "Timer "+this.id;
  }
}

export interface Action extends Collection{
  name:string;
}

export interface BioEvent extends Collection{
  name:string;
}
