import { ScenarioService } from 'src/app/services/scenario.service';
import { Listable } from '../interfaces/listable';
import { Tag } from './tag';
import { Vertex } from './vertex';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';
import { TagService } from 'src/app/services/tag.service';

export class Scenario extends Vertex implements Listable {
  title: string;
  description: string;
  tags: Map<string,Tag>;
  UA: number;
  implique: number;
  psy: number;
  UR: number;
  EU: number;
  decede:number;
  image: string;
  duration: number;
  coordPMA:[number,number]
  coordCADI:[number,number]
  coordPRV:[number,number]
  public static override className = 'Scenario';

  constructor(object?: any) {
    super(object);
    this.title = object?.title ? object.title : '';
    this.description = object?.description ? object.description : '';
    this.tags = object?.tags ? object.tags : new Map<string,Tag>();
    this.UA = object?.UA ? object.UA : 0;
    this.implique = object?.implique ? object.implique : 0;
    this.decede = object?.decede ? object.decede : 0;
    this.psy = object?.psy ? object.psy : 0;
    this.UR = object?.UR ? object.UR : 0;
    this.EU = object?.EU ? object.EU : 0;
    this.image = object?.image ? object.image : '';
    this.coordPMA = object?.coordPMA ? object.coordPMA : [48,52];
    this.coordPRV = object?.coordPRV ? object.coordPRV : [52,48];
    this.coordCADI = object?.coordCADI ? object.coordCADI : [48,48];
    this.duration = object?.duration ? object.duration : 100;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
  
    return list.map(element => new Scenario(element) as T)

  }

  public static override getType(element):string{return "scenario"}

  public static override getListTemplate<T extends Vertex>(apiService:ApiService):Observable<T[]>{

    return apiService.getClasseElements<T>(Scenario)

  }


}
