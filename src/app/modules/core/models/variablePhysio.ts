import { Collection } from "../services/firebase.service";


export interface VariablePhysio extends Collection{
    cible:number;
    rand:number;
    nom:string;
    min:number;
    max:number;
    couleur:string;
}