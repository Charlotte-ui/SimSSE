import { Button } from "../functions/display";
import { Nameable } from "./interfaces/nameable";
import { Timeable } from "./interfaces/timeable";
import { EventType } from "./vertex/node";
import { Edge, Vertex } from "./vertex/vertex";

export class Trigger extends Edge implements Timeable {
    time:number;
    editable:boolean;
    name:string;
    type:any;
    in:string;
    color:string;

    public static override className = "Trigger"

    constructor(object?:any) {
        super(object);
        this.time = (object?.time)?object.time:0;
        this.name = (object?.name )?object.name:'';
        this.type = (object?.type)?object.type:null;
        this.in = (object?.in)?object.in:null;
        this.color = (object?.color)?object.color:'#000000';
        this.editable = (object?.editable !== undefined)?object.editable:true;
    }

    public static override instanciateListe<T>(list: any[]): T[] {  
        return list.map(element => new Trigger(element) as T)
    }
}


export class Timestamp extends Edge implements Timeable {
    time:number;
    name:string;
    xAxis:number;
    yAxis:number;
    coord:[number,number];
    editable:false;

    public static override className = "TimStamp"

    constructor(object?:any) {
        super(object);
        this.time = (object?.time)?object.time:0;
        this.name = (object?.name )?object.name:'';
        this.xAxis = (object?.xAxis)?object.xAxis:0;
        this.yAxis = (object?.yAxis)?object.yAxis:0;
        this.coord = (object?.coord)?object.coord:[0,0];
    }

    public static override instanciateListe<T>(list: any[]): T[] {  
        return list.map(element => new Timestamp(element) as T)
    }
}