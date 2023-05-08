import { Collection } from '../../services/firebase.service';
import { Nameable } from '../interfaces/nameable';
import { Edge, Vertex } from './vertex';

export enum NodeType {
  trend = 'trend',
  event = 'event',
  graph = 'graph',
  link = 'link',
  timer = 'timer',
}

export enum EventType {
  start = 'start',
  bio = 'bio',
  action = 'action',
}

export abstract class Node extends Vertex implements Nameable {
  x: number;
  y: number;
  type: NodeType;
  state: boolean; // activate or not activate

  public static override className = 'Node';

  constructor(object?: any) {
    super(object);
    this.x = object?.x ? object.x : 50;
    this.y = object?.y ? object.y : 50;
    this.type = object?.type ? object.type : undefined;
    this.state = false;
  }

  abstract getName();

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];
    list.forEach((element: Node) => {
      switch (element.type) {
        case NodeType.trend:
          res.push(new Trend(element) as T);
          break;
        case NodeType.event:
          res.push(new Event(element) as T);
          break;
        case NodeType.graph:
          res.push(new Graph(element) as T);
          break;
        case NodeType.timer:
          break;
      }
    });

    return res;
  }
}

export class Trend extends Node {
  target: string;
  parameter: number;
  name: string;

  constructor(object?: any) {
    if (object) object["type"]=NodeType.trend;
    else object = {type:NodeType.trend};
    super(object);
    this.name = object?.name ? object.name : 'Tendance';
    this.target = object?.target ? object.target : undefined;
    this.parameter = object?.parameter ? object.parameter : 0;
  }

  override getName(): string {
    return this.name;
  }

}

export class Event extends Node {
  event: string;
  typeEvent: EventType;
  template: Action | BioEvent;

  constructor(object?: any) {
    if (object) object["type"]=NodeType.event;
    else object = {type:NodeType.event};
    super(object);
    this.event = object?.event ? object.event : undefined;
    this.typeEvent = object?.typeEvent ? object.typeEvent : undefined;
    this.template = object?.template ? object.template : undefined;
  }

  override getName(): string {
    return this.event;
  }
}

export class Link extends Edge {
  type: string;
  out: string;
  in: string;
  start: boolean;

  constructor(object?: any) {
    if (object) object["type"]=NodeType.link;
    else object = {type:NodeType.link};
    super(object);
    this.out = object?.out ? object.out.substring(1) : undefined;
    this.in = object?.in ? object.in.substring(1) : undefined;
    this.type = NodeType.link;
    this.start = object?.start !== undefined ? object.start : true;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];

    list.forEach((element) => {
      res.push(new Link(element) as T);
    });

    return res;
  }
}

export class Graph extends Node {
  name: string; // le graph est a la racine du modele, son nom est root
  nodes: Node[];
  links: Link[];
  template: string | boolean; // ref vers le graph template si instance, true si template
  public static graphs: Graph[] = [];

  public static override className = 'Graph';

  constructor(object?: any) {
    if (object) object["type"]=NodeType.graph;
    else object = {type:NodeType.graph};
    super(object);
    this.name = object?.name ? object.name : 'Groupe';
    this.nodes = object?.nodes ? object.nodes : [];
    this.links = object?.links ? object.links : [];
    this.template = object?.template ? object.template : false;
    Graph.graphs.push(this);
  }

  override getName(): string {
    return this.name;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];

    list.forEach((element) => {
      res.push(new Graph(element) as T);
    });

    return res;
  }

  public static getGraphByID(id: string): Graph {
    let result = undefined;
    Graph.graphs.forEach((graph: Graph) => {
      if (graph.id == id) result = graph;
    });
    return result;
  }
}

export class Timer extends Node {
  name: string;
  duration: number; // total duration of the timer
  counter: number; // curent time

  constructor(object?: any) {
    if (object) object['type'] = NodeType.timer;
    else object = {type:NodeType.timer};
    super(object);
    this.name = 'Timer ' + this.id; // TODO : pq le getName() ne fonctionne pas ?
    this.duration = 0;
    this.counter = 0;
  }

  public override getName(): string {
    return 'Timer ' + this.id;
  }
}

export class Action extends Vertex {
  public static override className = 'Action';
  public static actions: Action[] = [];

  name: string;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    Action.actions.push(this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];

    list.forEach((element) => {
      res.push(new Action(element) as T);
    });

    return res;
  }

  public static getActionByID(id: string): Action {
    let result = undefined;
    Action.actions.forEach((action: Action) => {
      if (action.id == id) result = action;
    });
    return result;
  }
}

export class BioEvent extends Vertex {
  public static override className = 'BioEvent';

  name: string;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];

    list.forEach((element) => {
      res.push(new BioEvent(element) as T);
    });

    return res;
  }
}
