import { ScenarioService } from 'src/app/services/scenario.service';
import { Listable } from '../interfaces/listable';
import { Tag } from './tag';
import { Vertex } from './vertex';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';

export class Scenario extends Vertex implements Listable {
  title: string;
  description: string;
  tags: Tag[];
  UA: number;
  implique: number;
  psy: number;
  UR: number;
  EU: number;
  image: string;
  PMAx:number;
  PMAy:number;
  CADIx:number;
  CADIy:number;
  PRVx:number;
  PRVy:number;

  public static override className = 'Scenario';

  constructor(object?: any) {
    super(object);
    this.title = object?.title ? object.title : '';
    this.description = object?.description ? object.description : '';
    this.tags = object?.tags ? object.tags : [];
    this.UA = object?.UA ? object.UA : 0;
    this.implique = object?.implique ? object.implique : 0;
    this.psy = object?.psy ? object.psy : 0;
    this.UR = object?.UR ? object.UR : 0;
    this.EU = object?.EU ? object.EU : 0;
    this.image = object?.image ? object.image : '';
    this.PMAx = object?.PMAx ? object.PMAx : 50;
    this.PMAy = object?.PMAy ? object.PMAy : 50;
    this.CADIx = object?.CADIx ? object.CADIx : 50;
    this.CADIy = object?.CADIy ? object.CADIy : 50;
    this.PRVx = object?.PRVx ? object.PRVx : 50;
    this.PRVy = object?.PRVy ? object.PRVy : 50;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
  
    return list.map(element => new Scenario(element) as T)

  }

  public static override getType(element):string{return "scenario"}

  public static override getListTemplate<T extends Vertex>(apiService:ApiService):Observable<T[]>{

    return apiService.getClasseElements<T>(Scenario)

  }
}
