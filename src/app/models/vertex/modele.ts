import { Listable } from '../interfaces/listable';
import { Graph, Link, Node } from './node';
import { Tag } from './tag';
import { Trigger } from '../trigger';
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

export interface ModeleSaverArrays {
  champToUpdate: string[];
  newTags: Tag[];
  tagsToDelete: Tag[];
  triggerToUpdate: Trigger[];
  triggerToDelete: Trigger[];
  oldGraph:Graph;
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

  public initSaver(): ModeleSaverArrays {
    let saver = {} as ModeleSaverArrays;
    saver.champToUpdate = [];
    saver.newTags = [];
    saver.tagsToDelete = [];
    saver.triggerToDelete = [];
    saver.triggerToUpdate = [];
    saver.oldGraph = structuredClone(this.graph)

    console.log('init saver ',saver)
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
    let requests: Observable<any>[] = [of('saveModel')];

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

    if (!isDeepEqual(saver.oldGraph,this.graph)
    ){
      console.log("le graph a changé")

      console.log("old graph ",saver.oldGraph)
      console.log("new graph ",this.graph)

      let nodeToUpdate = this.graph.nodes.filter((node:Node) => {
        let oldNode = getElementByChamp<Node>(saver.oldGraph.nodes,'id',node.id) 
        if (oldNode) return !isDeepEqual(node,oldNode)
        return true;
      }).map((node:Node) => node.id)

      let nodeToDelete = saver.oldGraph.nodes.filter((oldNode:Node) => {
        let node = getElementByChamp<Node>(this.graph.nodes,'id',oldNode.id) 
        if (node) return false
        return true;
      }).map((node:Node) => node.id)

      let linkToUpdate = this.graph.links.filter((link:Link) => {
        let oldLink = getElementByChamp<Link>(saver.oldGraph.links,'id',link.id) 
        if (oldLink) return !isDeepEqual(link,oldLink)
        return true;
      }).map((link:Link) => link.id)

      let linkToDelete = saver.oldGraph.links.filter((oldLink:Link) => {
        let link = getElementByChamp<Link>(this.graph.links,'id',oldLink.id) 
        if (link) return false
        return true;
      }).map((link:Link) => link.id)

      console.log("node to update ",nodeToUpdate)
      console.log("node to delete ",nodeToDelete)
      console.log("link to update ",linkToUpdate)

      console.log("link to delete ",linkToDelete)


       requests.push(
        nodeService.updateGraph(
          this.graph,
          nodeToUpdate,
          nodeToDelete,
          linkToUpdate,
          linkToDelete
        )
      ); 
    }
    else console.log("le graph n'a pas changé")
  

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
    return requests;
  }
}
