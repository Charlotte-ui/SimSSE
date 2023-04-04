import { Collection } from "../services/firebase.service";

export enum TypeVariable {
    SpO2 = "SpO2",
    FR = "FR",
    RC = "RC",
    Temp = "Temp",
    HemoCue = "HemoCue",
    PAS = "PAS",
    PAD = "PAD",
}


export interface VariablePhysio extends Collection{
    cible:number;
    rand:number;
    type:TypeVariable;
}