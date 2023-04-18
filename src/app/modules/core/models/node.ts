import { Collection } from "../services/firebase.service";

export interface Node extends Collection{
    name: string;
    x: number;
    y: number;
    type: string;
    state: boolean; // activate or not activate
}


export interface Trend extends Node{
    cible: string;
    pente: number;
}

export interface Event extends Node{
    event: string;
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
  gabarit:boolean;

}
