import { Listable } from '../interfaces/listable';
import { Graph, Link, Node } from './node';
import { Tag } from './tag';
import { Timestamp, Trigger } from '../trigger';
import { Vertex } from './vertex';
import { ApiService } from 'src/app/services/api.service';
import { Observable, of } from 'rxjs';
import { TagService } from 'src/app/services/tag.service';
import { ModeleService } from 'src/app/services/modele.service';
import { NodeService } from 'src/app/services/node.service';
import { getElementByChamp, isDeepEqual } from 'src/app/functions/tools';

export enum Triage {
  UR = 'UR',
  EU = 'EU',
  UA = 'UA',
}

export class Modele extends Vertex implements Listable {
  title: string;
  description: string;
  triage: Triage;
  template: boolean | string;
  graph: Graph;
  triggeredEvents: Map<string,Trigger>;
  tags: Tag[];
  timeStamps: Map<string,Timestamp>;

  public static override className = 'Modele';

  constructor(object?: any) {
    super(object);
    this.title = object?.title ? object.title : '';
    this.description = object?.description ? object.description : '';
    this.tags = object?.tags ? object.tags : [];
    this.triage = object?.triage ? object.triage : 0;
    this.template = object?.template ? object.template : 0;
    this.graph = object?.graph ? object.graph : 0;
    this.triggeredEvents = object?.triggeredEvents
      ? object.triggeredEvents
      :new Map<string,Trigger>();
    this.timeStamps = object?.timeStamps ? object.timeStamps : new Map<string,Timestamp>();
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new Modele(element) as T);
  }

  public static override getType(element): string {
    return 'modele';
  }

  public static override getListTemplate<T extends Vertex>(
    apiService: ApiService
  ): Observable<T[]> {
    return apiService.getClasseElementsWhithMatchingChamp<T>(
      Modele,
      'template',
      true
    );
  }

}
