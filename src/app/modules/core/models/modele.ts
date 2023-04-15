import { Listable } from "./listable";


export enum Triage {
    UR = "UR",
    EU = "EU",
    UA = "UA"
}


export interface Modele extends Listable{
    triage:Triage;
    gabarit:boolean;


}
