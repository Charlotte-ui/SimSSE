import { Collection } from "../services/firebase.service";

export enum TypeVariable {
    SpO2 = "SpO2",
    FR = "FR",
}


export interface VariablePhysio extends Collection{
    cible:number;
    rand:number;
    type:TypeVariable;
}