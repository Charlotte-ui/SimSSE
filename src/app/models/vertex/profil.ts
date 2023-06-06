import { VariablePhysioInstance } from "./variablePhysio";
import { Vertex } from "./vertex";


export class Profil extends Vertex {
    age:number;
    targetVariable:VariablePhysioInstance[];
    template:boolean;

    public static override className = "Profil"

    constructor(object?:any) {
        super(object);
        this.age = (object?.age)?object.age:0;
        this.template = (object?.template)?object.template:false;

        this.targetVariable = [];
    }
}
