import { Listable } from "./listable";
import { Graph } from "./node";
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
    gabarit:boolean;
    graph:Graph;
    triggeredEvents:[number,string][];
    tags:string[];

    public static override className = "Modele"

    constructor(object?:any) {
        super(object);
        this.title = (object?.title)?object.title:"";
        this.description = (object?.description)?object.description:"";
        this.tags = (object?.tags)?object.tags:[];
        this.triage = (object?.triage)?object.triage:0;
        this.gabarit = (object?.gabarit)?object.gabarit:0;
        this.graph = (object?.graph)?object.graph:0;
        this.triggeredEvents = (object?.triggeredEvents)?object.triggeredEvents:[];
    }

    public static override instanciateListe<T>(list: any[]): T[] {
        let res: T[] = []

        list.forEach(element => {
            element["id"] = element["@rid"].substring(1) // delete the #
            res.push(new Modele(element) as T)
        });
        return res;
    }

}
