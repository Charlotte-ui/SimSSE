import { Collection } from "../services/firebase.service";


export enum NodeType {
  trend = "trend",
  event = "event",
  graph = "graph",
  link = "link"
}

export enum EventType {
  start = "start",
  bio = "bio",
  action = "action"
}


export interface Node extends Collection{
    name: string;
    x: number;
    y: number;
    type: NodeType;
    state: boolean; // activate or not activate
}


export interface Trend extends Node{
    cible: string;
    pente: number;
}

export interface Event extends Node{
    event: string;
    typeEvent:string;
}

export interface Link extends Collection{
    type: string;
    source: number,
    target: number,
    start:boolean
}

export interface Graph extends Node{
  nodes: Node[];
  links: Link[];
  gabarit:string|boolean; // ref vers le graph gabarit si instance, true si gabarit
  root:boolean; // le graph est a la racine du modele (true) ou fait partie d'un autre graph (false)
}

export interface Action extends Collection{
  name:string;
}

export interface BioEvent extends Collection{
  name:string;
}
