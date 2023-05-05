import { Vertex } from "./vertex";

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
        let res: T[] = []

        list.forEach(element => {
            res.push(new Trigger(element) as T)
        });
        return res;
    }
}
