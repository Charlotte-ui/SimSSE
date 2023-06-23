import { getElementByChamp, pushWithoutDuplicateByChamp } from 'src/app/functions/tools';
import { Nameable } from '../interfaces/nameable';
import { Template } from '../interfaces/templatable';
import { Action, BioEvent } from './event';
import { Edge, Vertex } from './vertex';

const GREEN = '#45C456';
const RED = '#A41313';
const ORANGE = '#ff9f1c';

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

export enum LinkType {
  start = 'start',
  stop = 'stop',
  pause = 'pause',
}

export abstract class Node extends Vertex {
  x: number;
  y: number;
  type: NodeType;
  state: boolean; // activate or not activate

  public static override className = 'Node';
  public static updatables = [];

  constructor(object?: any) {
    super(object);
    this.x = object?.x ? object.x : 50;
    this.y = object?.y ? object.y : 50;
    this.type = object?.type ? object.type : undefined;
    this.state = false;
  }

  static getName(element): string {
    switch (element.type) {
      case NodeType.event:
        return Event.getName(element);
      case NodeType.trend:
        return Trend.getName(element);
      case NodeType.graph:
        return Graph.getName(element);
      case NodeType.timer:
        return Timer.getName(element);
    }
    return '';
  }

  public static override getType(element): string {
    if (element.type == NodeType.event) return Event.getType(element);
    return element.type;
  }

  public static getUpdatables(element): string[] {
    if (element.type == NodeType.event) return Event.updatables;
    if (element.type == NodeType.timer) return Timer.updatables;
    return Trend.updatables;
  }

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
          res.push(new Timer(element) as T);
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

  public static override updatables =['target','parameter','name'];

  constructor(object?: any) {
    if (object) object['type'] = NodeType.trend;
    else object = { type: NodeType.trend };
    super(object);
    this.name = object?.name ? object.name : 'Tendance';
    this.target = object?.target ? object.target : undefined;
    this.parameter = object?.parameter ? object.parameter : 0;
  }

  static override getName(element): string {
    return element.name;
  }
}

export class Event extends Node {
  event: string;
  typeEvent: EventType;
  template: Action | BioEvent;

  public static override updatables =['typeEvent','event','template'];


  constructor(object?: any) {
    if (object) object['type'] = NodeType.event;
    else object = { type: NodeType.event };
    super(object);
    this.event = object?.event ? object.event : undefined;
    this.typeEvent = object?.typeEvent ? object.typeEvent : undefined;
    this.template = object?.template ? object.template : undefined;
  }

  static createStart(): Event {
    return new Event({
      event: EventType.start,
      typeEvent: EventType.start,
      x: 5,
      y: 95,
    });
  }

  static override getName(element): string {
    return (element as Event).template
      ? (element as Event).template.name : element.event;
      //: 
  }

  public static override getType(element): string {
    return element.typeEvent;
  }
}

export class Link extends Edge {
  type: string;
  out: string;
  in: string;
  trigger: LinkType;

  constructor(object?: any) {
    if (object) object['type'] = NodeType.link;
    else object = { type: NodeType.link };
    super(object);
    this.out = object?.out ? object.out.substring(1) : undefined;
    this.in = object?.in ? object.in.substring(1) : undefined;
    this.type = NodeType.link;
    this.trigger = object?.trigger ? object.trigger : LinkType.start;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new Link(element) as T);
  }

  public static override getType(element): string {
    if (element['type'] === NodeType.link) return 'link';
    else return Node.getType(element);
  }

  /**
   * attribute color and icon to a link
   */
  public static getColor(link:Link) {
    let color = '';
    switch (link.trigger) {
      case LinkType.start:
        color = GREEN;
        break;
      case LinkType.stop:
        color = RED;
        break;
      case LinkType.pause:
        color = ORANGE;
        break;
    }
    return color;
  }

  public static getIcon(link:Link) {
    let icon = `<img src="../assets/icons/${link.trigger}.png" width="20" height="20">`;
    return icon;
  }
}

export class Graph extends Node implements Template {
  name: string; // le graph est a la racine du modele, son nom est root
  nodes: Node[];
  links: Link[];
  template: string | boolean; // ref vers le graph template si instance, true si template
  public static graphs: Graph[] = [];

  public static override className = 'Graph';

  constructor(object?: any) {
    if (object) object['type'] = NodeType.graph;
    else object = { type: NodeType.graph };
    super(object);
    this.name = object?.name ? object.name : 'Groupe';
    this.nodes = object?.nodes ? object.nodes : [];
    this.links = object?.links ? object.links : [];
    this.template = object?.template ? object.template : false;

    if (this.template) Graph.graphs = pushWithoutDuplicateByChamp<Graph>(Graph.graphs,this,'name')
  }

  static override getName(element): string {
    return element.name;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];

    list.forEach((element) => {
      res.push(new Graph(element) as T);
    });

    return res;
  }

  
  public static getGraphById(id: string) {
    return getElementByChamp<Graph>(Graph.graphs, 'id', id);
  }
}

export class Timer extends Node {
  name: string;
  duration: number; // total duration of the timer
  counter: number; // curent time

  public static override updatables =['duration'];


  constructor(object?: any) {
    if (object) object['type'] = NodeType.timer;
    else object = { type: NodeType.timer };
    super(object);
    this.name = object?.name ? object.name : 'Timer';
    this.duration = object?.duration ? object.duration : 0;
    this.counter = object?.counter ? object.counter : 0;
  }

  static override getName(element): string {
    return ''//element.name;
  }
}
