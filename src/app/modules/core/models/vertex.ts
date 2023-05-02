export class Vertex {
   
    id:string;
    public static className;

    constructor(object?:any) {
        if (object && object['@rid']) object['id'] = object['@rid'].substring(1);
        this.id = object?.id ? object.id : '';
    }

    public static instanciateListe<T>(list:any[]):T[]{return undefined}

}