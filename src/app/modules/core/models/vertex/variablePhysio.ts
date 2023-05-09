import { number } from "echarts";
import { Collection } from "../../services/firebase.service";
import { Nameable } from "../interfaces/nameable";
import { Vertex } from "./vertex";


export abstract class VariablePhysio extends Vertex implements Nameable{
    rand:number;
    name:string;
    min:number;
    max:number;
    color:string;

    constructor(object?: any) {
      super(object);
      this.rand=object?.rand ? object.rand : 1;
      this.name=object?.name ? object.name : "";
      this.min=object?.min ? object.min : 0;
      this.max=object?.max ? object.max : 100;
      this.color=object?.color ? object.color : "";
    }

    public getName(): string {
      return this.name;
    }

}

export class VariablePhysioTemplate extends VariablePhysio{
  moyennesAge:[number,number,number,number,number,number,number,number,number,number]
  sdAge:number

    public static override className = 'VariablePhysioTemplate';

  constructor(object?:any) {
    super(object);
    this.moyennesAge = object?.moyennesAge?object.moyennesAge:[50,50,50,50,50,50,50,50,50,50];
    this.sdAge = object?.sdAge?object.sdAge:1;
  }

    public static override instanciateListe<T>(list: any[]): T[] {
    return list.map(element => new VariablePhysioTemplate(element) as T)
  }
}

export class VariablePhysioInstance extends VariablePhysio{
  cible:number;
  template:string; // id of the variable template

  constructor(object?:any) {
    super(object);
    this.cible = object?.cible?object.cible:50;
    this.template = object?.template?object.template:"";
  }


}
