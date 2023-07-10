import { Listable } from '../interfaces/listable';
import { Graph, Link, Node } from './node';
import { Tag } from './tag';
import { Timestamp, Trigger } from '../trigger';
import { Vertex } from './vertex';
import { ApiService } from 'src/app/services/api.service';
import { Observable, map, of, switchMap } from 'rxjs';
import { TagService } from 'src/app/services/tag.service';
import { ModeleService } from 'src/app/services/modele.service';
import { NodeService } from 'src/app/services/node.service';
import { getElementByChamp, isDeepEqual } from 'src/app/functions/tools';
import { Template } from '../interfaces/templatable';
import { GraphService } from 'src/app/services/graph.service';

export enum Triage {
  UR = 'UR',
  EU = 'EU',
  UA = 'UA',
}

export class Modele extends Vertex implements Listable {
  title: string;
  description: string;
  examun: string;
  triage: Triage;
  template: boolean | string;
  graph: Graph;
  triggeredEvents: Map<string, Trigger>;
  tags: Map<string, Tag>;
  timeStamps: Map<string, Timestamp>;

  public static override className = 'Modele';
  public static override updatables = ['title', 'description', 'examun'];

  constructor(object?: any) {
    super(object);
    this.title = object?.title ? object.title : '';
    this.description = object?.description ? object.description : '';
    this.examun = object?.examun ? object.examun : '';
    this.tags = object?.tags ? object.tags : new Map<string, Tag>();
    this.triage = object?.triage ? object.triage : 0;
    this.template = object?.template ? object.template : 0;
    this.graph = object?.graph ? object.graph : 0;
    this.triggeredEvents = object?.triggeredEvents
      ? object.triggeredEvents
      : new Map<string, Trigger>();
    this.timeStamps = object?.timeStamps
      ? object.timeStamps
      : new Map<string, Timestamp>();
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

  public dupplicate(
    service: ModeleService,
    graphService: GraphService
  ): Observable<Modele> {
   

    return service
      .getGraphModele(this.id)
      .pipe(
        switchMap((graph: Graph) => {
          this.graph = graph;
          return graphService.initGraph(this.graph);
        })
      )
      .pipe(
        map((result: [Template[], Link[]]) => {
          graphService.initTemplateAndLinks(result, this.graph);
           let newModele = new Modele(structuredClone(this));
          newModele.title = 'copie de ' + newModele.title;
          console.log('dupplicate ',this)
          return newModele;
        })
      );
  }
}
