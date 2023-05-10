import { Listable } from "../interfaces/listable";
import { Graph,Node } from "./node";
import { Tag } from "./tag";
import { Trigger } from "../trigger";
import { VariablePhysioTemplate } from "./variablePhysio";
import { Vertex } from "./vertex";


export enum Triage {
    UR = "UR",
    EU = "EU",
    UA = "UA"
}

export class Modele extends Vertex implements Listable{
    createVariableCible(varTemp: VariablePhysioTemplate) {
      throw new Error('Method not implemented.');
    }
    title: string;
    description: string;
    triage:Triage;
    template:boolean;
    graph:Graph;
    triggeredEvents:Trigger[];
    tags:Tag[];
    timeStamps:number[];

    public static override className = "Modele"

    constructor(object?:any) {
        super(object);
        this.title = (object?.title)?object.title:"";
        this.description = (object?.description)?object.description:"";
        this.tags = (object?.tags)?object.tags:[];
        this.triage = (object?.triage)?object.triage:0;
        this.template = (object?.template)?object.template:0;
        this.graph = (object?.graph)?object.graph:0;
        this.triggeredEvents = (object?.triggeredEvents)?object.triggeredEvents:[];
        this.timeStamps = (object?.timeStamps)?object.timeStamps:[];
    }

    public static override instanciateListe<T>(list: any[]): T[] {
        return list.map(element => new Modele(element) as T)
    }

    public static override getType(element):string{return "modele"}

    

}
