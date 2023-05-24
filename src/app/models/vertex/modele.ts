import { Listable } from '../interfaces/listable';
import { Graph, Node } from './node';
import { Tag } from './tag';
import { Trigger } from '../trigger';
import { Vertex } from './vertex';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';
import { TagService } from 'src/app/services/tag.service';
import { ModeleService } from 'src/app/services/modele.service';
import { NodeService } from 'src/app/services/node.service';

export enum Triage {
  UR = 'UR',
  EU = 'EU',
  UA = 'UA',
}

export interface ModeleSaverArrays {
  nodeToUpdate: string[];
  nodeToDelete: string[];
  linkToUpdate: string[];
  linkToDelete: string[];
  champToUpdate: string[];
  newTags: Tag[];
  tagsToDelete: Tag[];
  triggerToUpdate: Trigger[];
  triggerToDelete: Trigger[];
}

export class Modele extends Vertex implements Listable {
  title: string;
  description: string;
  triage: Triage;
  template: boolean | string;
  graph: Graph;
  triggeredEvents: Trigger[];
  tags: Tag[];
  timeStamps: number[];

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
      : [];
    this.timeStamps = object?.timeStamps ? object.timeStamps : [];
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

  public static initSaver(): ModeleSaverArrays {
    let saver = {} as ModeleSaverArrays;
    saver.champToUpdate = [];
    saver.linkToDelete = [];
    saver.linkToUpdate = [];
    saver.newTags = [];
    saver.nodeToDelete = [];
    saver.nodeToUpdate = [];
    saver.tagsToDelete = [];
    saver.triggerToDelete = [];
    saver.triggerToUpdate = [];
    return saver;
  }

  /**
   * save the diffrent elements of the modele in the bdd
   */
  public save(
    saver: ModeleSaverArrays,
    tagService: TagService,
    modeleService: ModeleService,
    nodeService: NodeService
  ): Observable<any>[] {
    let requests: Observable<any>[] = [];

    // save the tags
    if (saver.newTags && saver.newTags.length > 0)
      requests.push(
        tagService.addTagsToSource(saver.newTags, this.id, 'modele')
      );

    if (saver.tagsToDelete && saver.tagsToDelete.length > 0)
      requests.push(
        tagService.deleteTagsFromSource(saver.tagsToDelete, this.id)
      );

    // save the proprerties
    if (saver.champToUpdate.length > 0)
      requests.push(modeleService.updateModele(this, saver.champToUpdate));

    // save the graph
    if (
      (saver.nodeToUpdate && saver.nodeToUpdate.length > 0) ||
      (saver.nodeToDelete && saver.nodeToDelete.length > 0) ||
      (saver.linkToUpdate && saver.linkToUpdate.length > 0) ||
      (saver.linkToDelete && saver.linkToDelete.length > 0)
    )
      requests.push(
        nodeService.updateGraph(
          this.graph,
          saver.nodeToUpdate,
          saver.nodeToDelete,
          saver.linkToUpdate,
          saver.linkToDelete
        )
      );

    // save the triggers
    if (
      (saver.triggerToUpdate && saver.triggerToUpdate.length > 0) ||
      (saver.triggerToDelete && saver.triggerToDelete.length > 0)
    )
      requests.push(
        modeleService.updateTriggers(
          this,
          saver.triggerToUpdate,
          saver.triggerToDelete
        )
      );

    console.log('save ', requests);

    return requests;
  }
}
