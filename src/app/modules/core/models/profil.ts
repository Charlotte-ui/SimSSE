import { Collection } from "../services/firebase.service";
import { Vertex } from "./vertex";


export class Profil extends Vertex implements Collection{
    id: string;
    age:number;

    public static override className = "Profil"

    constructor(object?:any) {
        super(object);
        this.age = (object?.age)?object.age:0;
        this.id = (object?.id)?object.id:"";
    }
}
