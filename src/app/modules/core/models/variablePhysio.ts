import { number } from "echarts";
import { Collection } from "../services/firebase.service";
import { Nameable } from "./nameable";


export abstract class VariablePhysio implements Collection,Nameable{
    id:string;
    rand:number;
    name:string;
    min:number;
    max:number;
    couleur:string;

    constructor(id:string,rand:number,name:string,min:number,max:number,couleur:string) {
      this.id = id;
      this.rand=rand;
      this.name=name;
      this.min=min;
      this.max=max;
      this.couleur=couleur;
    }


    public getName(): string {
      return this.name;
    }

}

export class VariablePhysioGabarit extends VariablePhysio{
  moyennesAge:[number,number,number,number,number,number,number,number,number,number]
  sdAge:number


  constructor(id:string,rand:number,name:string,min:number,max:number,couleur:string,moyennesAge?:[number,number,number,number,number,number,number,number,number,number],sdAge?:number) {
    super(id,rand,name,min,max,couleur);
    this.moyennesAge = (moyennesAge)?moyennesAge:undefined;
    this.sdAge = (sdAge)?sdAge:0;
  }
}

export class VariablePhysioInstance extends VariablePhysio{
  cible:number;

  constructor(id:string,rand:number,name:string,min:number,max:number,couleur:string,cible?:number) {
    super(id,rand,name,min,max,couleur);
    this.cible = (cible)?cible:0;

  }


}
