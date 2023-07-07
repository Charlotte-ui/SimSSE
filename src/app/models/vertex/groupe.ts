import { Vertex } from "./vertex";

export class Groupe extends Vertex{
    implique:number;
    psy:number;
    UA:number;
    UR:number;
    EU:number;
    scenario:string;
    scene:number;
    x:number;
    y:number;
    t0:number;

    public static override className = "Groupe"

    public static override updatables =['implique','psy','EU','UA','UR'];


    constructor(object?:any) {
        super(object);
        this.scenario = (object?.scenario)?object.scenario:"";
        this.scene = (object?.scene)?object.scene:-1;
        this.x = (object?.x)?object.x:50
        this.y = (object?.y)?object.y:50
        this.UA = (object?.UA)?object.UA:0;
        this.implique = (object?.implique)?object.implique:0;
        this.psy = (object?.psy)?object.psy:0;
        this.UR = (object?.UR)?object.UR:0;
        this.EU = (object?.EU)?object.EU:0;
        this.t0 = (object?.t0)?object.t0:0;

    }

    public static override instanciateListe<T>(list: any[]): T[] {
      return list.map(element => new Groupe(element) as T)
    }

    
    public static override getType(element):string{return "groupe"}
}
