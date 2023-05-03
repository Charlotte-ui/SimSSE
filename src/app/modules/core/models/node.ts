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

export abstract class Node implements Collection, Nameable{
    id: string;
    x: number;
    y: number;
    type: NodeType;
    state: boolean; // activate or not activate

    constructor(id:string,x:number,y:number,type:NodeType) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.type = type;
      this.state = false ;
    }
    
  abstract getName();

}

export class Trend extends Node{

    cible: string;
    pente: number;
    name: string;

    constructor(id:string,x:number,y:number,name?:string,cible?:string,pente?:number) {
      super(id,x,y,NodeType.trend);
      this.name = (name)?name:'Tendance ' + id;
      this.cible = (cible)?cible:undefined;
      this.pente = (pente)?pente:0;
    }


    override getName(): string {
      return this.name;
    }
}

export  class Event extends Node{

    event: string;
    typeEvent:string;

    constructor(id:string,x:number,y:number,type:EventType,event?:string) {
      super(id,x,y,NodeType.event);
      this.event = (event)?event:undefined;
      this.typeEvent = type;
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


  constructor(id:string,x:number,y:number,name?:string,nodes?:Node[],links?:Link[],gabarit?:boolean,root?:boolean) {
    super(id,x,y,NodeType.graph);
    this.name = (name)?name:'Groupe ' + id;
    this.nodes =(nodes)?nodes: undefined;
    this.links = (links)?links:undefined;
    this.gabarit = (gabarit)?gabarit:false;
    this.root = (root)?root:false;
  }

  override getName(): string {
    return this.name;
  }

}

export class Timer extends Node{
  name:string;
  duration:number; // total duration of the timer
  counter:number;  // curent time

  constructor(id:string,x:number,y:number) {
    super(id,x,y,NodeType.timer);
    this.name = "Timer "+this.id; // TODO : pq le getName() ne fonctionne pas ?
    this.duration = 0;
    this.counter = 0
  }

  public override getName(): string {
    return "Timer "+this.id;
  }
}

export class Action extends Vertex{
  public static override className = 'Action';

  name:string;

  
  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];
    console.log('instanciateListe');

    console.log(list);

    list.forEach((element) => {
      element['id'] = element['@rid'].substring(1); // delete the #
      res.push(new Action(element) as T);
    });

    return res;
  }
}

export class BioEvent extends Vertex{
  public static override className = 'Event';

  name:string;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];
    console.log('instanciateListe');

    console.log(list);

    list.forEach((element) => {
      element['id'] = element['@rid'].substring(1); // delete the #
      res.push(new BioEvent(element) as T);
    });

    return res;
  }


}
