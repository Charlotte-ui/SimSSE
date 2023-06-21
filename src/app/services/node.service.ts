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

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  constructor(private apiService: ApiService) {}

  /**
   * READ
   */

  /**
   * get the template of an event
   * @param id
   * @param eventType
   * @returns
   */
  getEventTemplate(
    id: string,
    eventType: EventType
  ): Observable<Action | BioEvent> {
    if (eventType == EventType.action)
      return this.apiService
        .getDocument(id)
        .pipe(map((response) => new Action(response)));
    if (eventType == EventType.bio)
      return this.apiService
        .getDocument(id)
        .pipe(map((response) => new BioEvent(response)));
    return undefined;
  }

  getGraphTemplate(graph: Graph): Observable<Graph> {
    return this.apiService
      .getRelationFrom(graph.id, 'aTemplate', 'Graph')
      .pipe(map((response) => new Graph(response.result[0])));
  }

  getAllGraphTemplate(): Observable<Graph[]> {
    return this.apiService.getClasseElementsWhithMatchingChamp<Graph>(
      Graph,
      'template',
      'true'
    );
  }

  /**
   * CREATE
   */

  /**
   * push a new Graph in the database
   * return the id of the new Graph and the id of the first node in an array
   * @param graph
   */
  createGraph(graph: Graph): Observable<string[]> {
    graph['@class'] = 'Graph';
    delete graph.id;
    delete graph.nodes;
    delete graph.links;
    //  return this.apiService.createDocument(graph)
    //
    return this.apiService
      .createDocument(graph)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((idGraph: string) => {
          let start = Event.createStart();
          start['@class'] = 'Event';
          delete start.id;
          return this.apiService
            .createDocument(start)
            .pipe(map((response) => this.apiService.documentId(response)))
            .pipe(
              switchMap((idStart: string) =>
                this.apiService
                  .createRelationBetween(idStart, idGraph, 'aNode')
                  .pipe(
                    map((response) => [
                      response.result[0].out,
                      response.result[0].in,
                    ])
                  )
              )
            );
        })
      );
  }

  /**
   * push a new Node in the database
   * return the id of the new Node
   * @param node
   */
  createNode(node: Node, classe: string): Observable<string> {
    node['@class'] = classe;
    delete node.id;
    return this.apiService
      .createDocument(node)
      .pipe(map((response) => this.apiService.documentId(response)));
  }

    /**
   * create a node and link it to a graph
   * return the node ID
   * @param node 
   * @param graph 
   * @returns 
   */
  addNodeToGraph(node: Node, graph: Graph) {
    let request: Observable<string>;
    if (node.type === NodeType.graph) {
      // create a graph node
      request = this.createGraphNode(structuredClone(node as Graph));
    } else {
      // create a trend or event node
      request = this.createNode(
        structuredClone(node),
        [...node.type][0].toUpperCase() + node.type.slice(1)
      );
    }

    return request.pipe(
      switchMap((newNodeIndex: string) => {
        return this.apiService.createRelationBetween(
          newNodeIndex,
          graph.id,
          'aNode'
        ).pipe(map(() => newNodeIndex));
      })
    );
  }

  /**
   * push a new Graph in the database
   * link the graph to his template
   * return the id of the new Graph
   * @param node
   */
  createGraphNode(graph: Graph): Observable<string> {
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
                return idNode;
              })
            )
        )
      );
  }

  /**
   * create a duplicate of all the node and link of the graph
   * @param graph
   * @returns
   */
  duplicateGraph(
    graphToCopy: Graph,
    idNewGraph: string,
    idNewStart: string
  ): Observable<any> {
    graphToCopy.id = idNewGraph;

    let nodeIds = [];

    graphToCopy.nodes.forEach((node: Node) => {
      if (Node.getType(node) === EventType.start) node.id = idNewStart;
      else {
        nodeIds.push(node.id);
        node.id = node.id.replace(':', '');
      }
    });

    graphToCopy.links.forEach((link: Link) => {
      link.in = nodeIds.includes(link.in) ? link.in.replace(':', '') : link.in;
      link.out = nodeIds.includes(link.out)
        ? link.out.replace(':', '')
        : link.out;
      link.id = link.id.replace(':', '');
    });

    // create new nodes and links
    return this.updateGraphNodes(graphToCopy).pipe(
      switchMap((indexesNode: string[]) => {
        return this.updateGraphLinks(graphToCopy, indexesNode);
      })
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

  updateGraph(
    graph: Graph,
    nodeToUpdate: string[],
    nodeToDelete: string[],
    linkToUpdate: string[],
    linkToDelete: string[]
  ): Observable<any> {
    let requests: Observable<any>[] = [];
    // create new nodes and links
    let requestCreate = this.updateGraphNodes(graph).pipe(
      switchMap((indexesNode: string[]) => {
        return this.updateGraphLinks(graph, indexesNode);
      })
    );
    requests.push(requestCreate);

    //update old nodes
    graph.nodes.forEach((node) => {
      if (!this.isNew(node.id) && nodeToUpdate.includes(node.id))
        requests.push(this.updateNode(structuredClone(node)));
    });

    //delete nodes
    nodeToDelete.forEach((nodeId) => {
      requests.push(this.apiService.deleteDocument(nodeId));
    });

    //update old links
    graph.links.forEach((link) => {
      if (!this.isNew(link.id) && linkToUpdate.includes(link.id))
        requests.push(this.updateLink(link));
    });

    //delete  links
    linkToDelete.forEach((linkId) => {
      requests.push(this.apiService.deleteEdge(linkId));
    });

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }

  /**
   * create the new nodes of a graph and add them to it
   * return an array of all the graph nodes
   * @param graph
   * @returns
   */
  updateGraphNodes(graph: Graph): Observable<string[]> {
    let indexGraph = graph.id;
    let requestsNode: Observable<string>[] = [];
    let oldNodeInddexes = [];

    // add new nodes
    graph.nodes.forEach((node) => {
      if (this.isNew(node.id)) {
        if (node.type === NodeType.graph) {
          // create a graph node
          requestsNode.push(
            this.createGraphNode(structuredClone(node as Graph))
          );
        } else {
          // create a trend or event node
          requestsNode.push(
            this.createNode(
              structuredClone(node),
              [...node.type][0].toUpperCase() + node.type.slice(1)
            )
          );
        }
      } else {
        // si le node est déjà présent
        oldNodeInddexes.push(node.id);
      }
    });

    if (requestsNode.length === 0) return of(oldNodeInddexes); // s'il n'y a pas de nouveaux nodes à ajouter

    return forkJoin(requestsNode).pipe(
      switchMap((newNodeIndexes: string[]) => {
        let requestLink: Observable<any>[] = newNodeIndexes.map(
          (indexNode: string) =>
            this.apiService.createRelationBetween(
              indexNode,
              indexGraph,
              'aNode'
            )
        );

        return from(requestLink).pipe(
          concatMap((request: Observable<any>) => request),
          reduce((acc, cur) => [...acc, cur], []),
          map(() => {
            return oldNodeInddexes.concat(newNodeIndexes);
          })
          // map(([first, second]) => [first, second])
        );
      })
    );
  }

  /**
   * create the new links of a graph 
=   * @param graph 
   * @returns 
   */
  updateGraphLinks(graph: Graph, indexesNode: string[]): Observable<any> {
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

  /**
   *
   * @param graph
   * @returns
   */
  deleteGraph(graph: Graph): any {
    let requests: Observable<any>[] = [];

    requests.push(
      this.apiService
        .getRelationFrom(graph.id, 'aNode', 'Graph')
        .pipe(map((response) => Node.instanciateListe<Node>(response.result)))
        .pipe(
          switchMap((nodes: Node[]) => {
            let requestsNode = nodes.map((node: Node) =>
              this.apiService.deleteDocument(node.id)
            );

            return from(requestsNode).pipe(
              concatMap((request: Observable<any>) => request)
            );
          })
        )
    );

    requests.push(this.apiService.deleteDocument(graph.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }
}
