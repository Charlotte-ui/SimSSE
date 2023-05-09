import { Vertex } from "./vertex/vertex";

export class Trigger extends Vertex {
    time:number;
    editable:boolean;

    public static override className = "Trigger"

    constructor(object?:any) {
        super(object);
        this.time = (object?.time)?object.time:0;
        this.editable = (object?.editable !== undefined)?object.editable:true;
    }

    public static override instanciateListe<T>(list: any[]): T[] {  
        return list.map(element => new Trigger(element) as T)
    }
}
