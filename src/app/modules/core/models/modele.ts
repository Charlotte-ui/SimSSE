import { Listable } from "./listable";
import { Graph } from "./node";


export enum Triage {
    UR = "UR",
    EU = "EU",
    UA = "UA"
}


export interface Modele extends Listable{
    triage:Triage;
    gabarit:boolean;
    graph:Graph;
    triggeredEvents:[number,string][];
    tags:string[];
}
