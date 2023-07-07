import { number } from 'echarts';
import { Nameable } from '../interfaces/nameable';
import { Vertex } from './vertex';
import { pushWithoutDuplicateByChamp } from 'src/app/functions/tools';

export abstract class VariablePhysio extends Vertex implements Nameable {
  name: string;
  rand: number;
  min: number;
  max: number;
  color: string;
  defaultValue: number;

  constructor(object?: any) {
    super(object);
    this.rand = object?.rand ? object.rand : 0;
    this.name = object?.name ? object.name : '';
    this.min = object?.min ? object.min : 0;
    this.max = object?.max ? object.max : 100;
    this.color = object?.color ? object.color : '';
    this.defaultValue = object?.defaultValue ? object.defaultValue : 50;
  }

  public getName(): string {
    return this.name;
  }
}

export class VariablePhysioTemplate extends VariablePhysio {
  moyennesAge: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];
  sdAge: number;

  public static override className = 'VariablePhysioTemplate';
  public static variables: Map<string,VariablePhysioTemplate> = new Map<string,VariablePhysioTemplate>();


  constructor(object?: any) {
    super(object);
    this.moyennesAge = object?.moyennesAge
      ? object.moyennesAge.split(',')
      : [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    this.sdAge = object?.sdAge ? object.sdAge : 1;
    VariablePhysioTemplate.variables.set(this.id,this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new VariablePhysioTemplate(element) as T);
  }

  public static override getType(element):string{return "variable physiologique"}

}

export class VariablePhysioInstance extends VariablePhysio {
  cible: number;
  template: string; // id of the variable template

  
  public static override updatables = ['cible']

  constructor(object?: any) {
    super(object);
    this.cible = object?.cible ? object.cible : 50;
    this.template = object?.template ? object.template : '';
  }

   public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new VariablePhysioInstance(element) as T);
  }
}
