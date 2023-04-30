import { Collection } from "../services/firebase.service";
import { Vertex } from "./vertex";

export class Groupe extends Vertex implements Collection{
    id: string;
    impliques:number;
    psy:number;
    UA:number;
    UR:number;
    EU:number;
    scenario:string;
    scene:number;
    position:(number|string)[]

    public static override className = "Groupe"

    constructor(object?:any) {
        super(object);
        if(object["@rid"]) object["id"] = object["@rid"].substring(1)
        this.scenario = (object?.scenario)?object.scenario:"";
        this.scene = (object?.scene)?object.scene:-1;
        this.position = (object?.position)?object.position:-1;
        this.id = (object?.id)?object.id:"";
        this.UA = (object?.UA)?object.UA:0;
        this.impliques = (object?.impliques)?object.impliques:0;
        this.psy = (object?.psy)?object.psy:0;
        this.UR = (object?.UR)?object.UR:0;
        this.EU = (object?.EU)?object.EU:0;

    }

    public static override instanciateListe<T>(list: any[]): T[] {
        let res: T[] = [];
        console.log('instanciateListe');
    
        console.log(list);
    
        list.forEach((element) => {
          element['id'] = element['@rid'].substring(1); // delete the #
          res.push(new Groupe(element) as T);
        });
    
        return res;
      }
}
