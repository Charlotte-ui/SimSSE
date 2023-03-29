import { Collection } from "../services/firebase.service";

export interface Node extends Collection{
    name: string;
    x: number;
    y: number;
    type: string;
}


export interface Trend extends Node{
    cible: string;
    pente: number;
}
  
export interface Event extends Node{
    event: string;
}

export interface Link extends Collection{
    source: string,
    target: string
}
