import { Listable } from '../interfaces/listable';
import { Tag } from './tag';
import { Vertex } from './vertex';

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
  }

  public static override instanciateListe<T>(list: any[]): T[] {
  
    return list.map(element => new Scenario(element) as T)

  }

  public static override getType(element):string{return "scenario"}
}
