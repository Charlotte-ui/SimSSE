import { Listable } from "./listable";
import { Graph } from "./node";
import { Vertex } from "./vertex";


export enum Triage {
    UR = "UR",
    EU = "EU",
    UA = "UA"
}

export class Modele extends Vertex implements Listable{
    title: string;
    description: string;
    id: string;
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
        this.id = (object?.id)?object.id:"";
        this.triage = (object?.triage)?object.triage:0;
        this.gabarit = (object?.gabarit)?object.gabarit:0;
        this.graph = (object?.graph)?object.graph:0;
        this.triggeredEvents = (object?.triggeredEvents)?object.triggeredEvents:0;
    }

    public static override instanciateListe<T>(list: any[]): T[] {
        let res: T[] = []

        list.forEach(element => {
            res.push(new Modele(element) as T)
        });
        return res;
    }

}
