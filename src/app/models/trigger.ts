import { Nameable } from "./interfaces/nameable";
import { Edge, Vertex } from "./vertex/vertex";

export class Trigger extends Edge {
    time:number;
    editable:boolean;
    name:string;
    xAxis:number;
    yAxis:number;
    coord:[number,number];
    type:any;
    in:string;

    public static override className = "Trigger"

    constructor(object?:any) {
        super(object);
        this.time = (object?.time)?object.time:0;
        this.editable = (object?.editable !== undefined)?object.editable:true;
        this.name = (object?.name )?object.name:'';
        this.xAxis = (object?.xAxis)?object.xAxis:0;
        this.yAxis = (object?.yAxis)?object.yAxis:0;
        this.coord = (object?.coord)?object.coord:[0,0];
        this.type = (object?.type)?object.type:null;
        this.in = (object?.in)?object.in:null;

    }

    public static override instanciateListe<T>(list: any[]): T[] {  
        return list.map(element => new Trigger(element) as T)
    }
}
