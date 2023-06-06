import { Vertex } from "./vertex";

export class Tag extends Vertex {
    value:string;
    
    public static override className = "Tag"

    constructor(object?:any) {
        super(object);
        this.value = (object?.value)?object.value:"";
    }

    public static override instanciateListe<T>(list: any[]): T[] {
        return list.map(element => new Tag(element) as T)
    }
}
