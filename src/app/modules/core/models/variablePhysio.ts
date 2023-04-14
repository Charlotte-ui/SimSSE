import { Collection } from "../services/firebase.service";


export interface VariablePhysio extends Collection{
    rand:number;
    nom:string;
    min:number;
    max:number;
    couleur:string;
}

export interface VariablePhysioGabarit extends VariablePhysio{
  moyennesAge:[number,number,number,number,number,number,number,number,number,number]
  sdAge:number
  moyennesSexe:[number,number]
  sdSexe:number
}

export interface VariablePhysioInstance extends VariablePhysio{
  cible:number;

}
