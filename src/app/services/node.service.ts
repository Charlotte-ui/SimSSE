import { Injectable } from '@angular/core';
import {
  Trend,
  Event,
  Link,
  Graph,
  NodeType,
  EventType,
  Node,
  LinkType,
} from '../models/vertex/node';
import {
  Observable,
  concat,
  concatMap,
  forkJoin,
  from,
  map,
  of,
  reduce,
  switchMap,
  zipAll,
} from 'rxjs';
import { ApiService } from './api.service';
import { Action, BioEvent } from '../models/vertex/event';
import {
  getElementByChamp,
  getElementByChampMap,
  remove,
} from '../functions/tools';
import { Template } from '../models/interfaces/templatable';
import { GraphService } from './graph.service';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  constructor(
    private apiService: ApiService,
    private graphService: GraphService
  ) {}

  /**
   * GETTERS -------------------------------------------
   */



  /**
   * CREATE
   */






  /**
   * push a new Graph in the database
   * link the graph to his template
   * return the new Graph
   * @param node
   */
  createGraphNode(graph: Graph): Observable<Graph> {
    graph['@class'] = 'Graph';
    delete graph.id;
    delete graph.links;
    delete graph.nodes;
    let templateId = graph.template;
    graph.template = false;
    return this.apiService
      .createDocument(graph)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((idNode: string) =>
          this.apiService
            .createRelationBetween(templateId.toString(), idNode, 'aTemplate')
            .pipe(
              map((res) => {
                graph.id = idNode;
                return graph;
              })
            )
        )
      );
  }

  /**
   * create a link between two Nodes
   * @param idIn
   * @param idOut
   * @param value
   * @returns
   */
  createLink(idIn: string, idOut: string, value: LinkType): Observable<Link> {
    return this.apiService
      .createRelationBetweenWithProperty(idIn, idOut, 'link', 'trigger', value)
      .pipe(map((response) => new Link(response.result[0])));
  }

  /**
   * UPDATE
   */

  /**
   * update a  Node in the database
   * @param node
   */
  updateNode(node: Node, champs?: string[]): Observable<string[]> {
    delete node['nodes'];
    delete node['links'];
    if (node.type == NodeType.graph && typeof node['template'] === 'string')
      node['template'] = false;

    if (champs) {
      let requests: Observable<any>[] = [];
      champs.forEach((champ) => {
        requests.push(
          this.apiService.updateDocumentChamp(
            node.id,
            champ,
            node[champ].toString()
          )
        );
      });

      return from(requests).pipe(
        concatMap((request: Observable<any>) => request)
      );
    }
    return this.apiService.updateAllDocumentChamp(node);
  }

  /**
   * update a link trigger value
   * @param node
   */
  updateLink(link: Link): Observable<string[]> {
    return this.apiService.updateDocumentChamp(
      link.id,
      'trigger',
      link.trigger
    );
  }

  /**
   * create the new links of a graph 
=   * @param graph 
   * @returns 
   */
  /*   updateGraphLinks(graph: Graph, indexesNode: string[]): Observable<any> {
    let requestsLinks: Observable<string>[] = [];

    graph.links.forEach((link) => {
      if (this.isNew(link.id))
        requestsLinks.push(
          this.apiService.createRelationBetweenWithProperty(
            this.getNodeId(link.in, graph.nodes, indexesNode),
            this.getNodeId(link.out, graph.nodes, indexesNode),
            'link',
            'trigger',
            link.trigger
          )
        );
    });

    if (requestsLinks.length === 0) return of({}); // s'il n'y a pas de nouveaux nodes à ajouter

    return from(requestsLinks).pipe(
      concatMap((request: Observable<any>) => request),
      reduce((acc, cur) => [...acc, cur], []),
      map((res: any[]) => {})
    );
  } */

  /**
   * group an ensemble of nodes from a graph
   * @param group
   * @param graph
   * @returns id of the new group and the start node
   */
  groupNodes(
    group: Graph,
    graph: Graph,
    linksIllegal: Map<string, Link>
  ): Observable<string[]> {
    return this.graphService
      .createGraph(structuredClone(group))
      .pipe(
        switchMap((idGroup: string) => {
          let start = Event.createStart();
          start['@class'] = 'Event';
          delete start.id;
          return this.apiService
            .createDocument(start)
            .pipe(map((response) => this.apiService.documentId(response)))
            .pipe(
              switchMap((idStart: string) =>
                this.apiService
                  .createRelationBetween(idStart, idGroup, 'aNode')
                  .pipe(
                    map((response) => [
                      response.result[0].out,
                      response.result[0].in,
                    ])
                  )
              )
            );
        })
      )
      .pipe(
        switchMap((indexes: string[]) => {
          let idGroup = indexes[0].substring(1);
          let idStart = indexes[1].substring(1);
          let requests: Observable<any>[] = [];
          requests.push(this.graphService.connectNodeToGraph(idGroup, graph.id));
          let requestsConnectNodes = Array.from(group.nodes).map(
            ([key, node]) => this.graphService.connectNodeToGraph(key, idGroup)
          );
          let requestsDisconnectNodes = Array.from(group.nodes).map(
            ([key, node]) => this.disconnectNodeFromGraph(key, graph.id)
          );

          let requestsDeleteLinks = Array.from(linksIllegal).map(
            ([key, link]) => this.deleteLink(link)
          );

          return from(
            requests
              .concat(requestsConnectNodes)
              .concat(requestsDisconnectNodes)
              .concat(requestsDeleteLinks)
          ).pipe(
            concatMap((request: Observable<any>) => request),
            reduce((acc, cur) => [...acc, cur], []),
            map(() => [idGroup, idStart])
          );
        })
      );
  }

  /**
   * delete a group from bdd and attach his node to the root graph
   * @param group
   * @param graph
   * @returns
   */
  ungroupNodes(group: Graph, graph: Graph): Observable<any[]> {
    // we do not rattach the start
    let start = getElementByChampMap<Node>(
      group.nodes,
      'event',
      EventType.start
    );
    group.nodes.delete(start.id);
    let requestConnect = Array.from(group.nodes).map(([key, node]) =>
      this.graphService.connectNodeToGraph(key, graph.id)
    );
    let requestDelete = [this.deleteNode(start), this.deleteNode(group)];
    return from(requestDelete.concat(requestConnect)).pipe(
      concatMap((request: Observable<any>) => request),
      reduce((acc, cur) => [...acc, cur], [])
    );
  }

  private isNew(id: string): boolean {
    return !id.includes(':');
  }

  public getNodeId(
    value: string,
    nodes: Node[],
    indexesNode: string[]
  ): string {
    let res = '';
    nodes.forEach((node: Node, index: number) => {
      if (value == node.id || value == (node as Event).event)
        res = indexesNode[index];
    });
    return res;
  }

  /**
   * DELETE
   */

  /**
   * delete a Link by id
   * @param link
   * @returns
   */
  deleteLink(link: Link): Observable<any> {
    return this.apiService.deleteEdge(link.id);
  }

  /**
   * delete a node by id
   * @param node
   * @returns
   */
  deleteNode(node: Node): Observable<any> {
    return this.apiService.deleteDocument(node.id);
  }

  disconnectNodeFromGraph(idNode: string, idGraph: string): Observable<any> {
    return this.apiService.deleteRelationBetween(idNode, idGraph);
  }
}
