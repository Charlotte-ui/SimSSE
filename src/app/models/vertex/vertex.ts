import { Observable, of } from "rxjs";
import { ApiService } from "src/app/services/api.service";

export class Vertex {
   
    id:string;
    public static className;

    constructor(object?:any) {
        if (object && object['@rid']) object['id'] = object['@rid'].substring(1);
        this.id = object?.id ? object.id : '';
    }

    
    public static instanciateListe<T>(list:any[]):T[]{return undefined}

    public static getType(element):string{return "vertex"}

    public static getListTemplate<T extends Vertex>(apiService:ApiService):Observable<T[]>{return of([])}


}

export class Edge {
   
    id:string;
    public static className;

    constructor(object?:any) {
        if (object && object['@rid']) object['id'] = object['@rid'].substring(1);
        this.id = object?.id ? object.id : '';
    }

    public static instanciateListe<T>(list:any[]):T[]{return undefined}

        public static getType(element):string{return "edge"}


}