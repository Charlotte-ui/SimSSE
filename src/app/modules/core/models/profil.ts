import { Collection } from "../services/firebase.service";
import { VariablePhysioInstance } from "./variablePhysio";
import { Vertex } from "./vertex";


export class Profil extends Vertex implements Collection{
    age:number;
    targetVariable:VariablePhysioInstance[];

    public static override className = "Profil"

    constructor(object?:any) {
        super(object);
        this.age = (object?.age)?object.age:0;
        this.targetVariable = [];
    }
}
