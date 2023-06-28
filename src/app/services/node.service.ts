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
import { getElementByChamp, remove } from '../functions/tools';

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
   * create  an aNode adge between a Node and a graph
   * @param idNode
   * @param idGraph
   * @returns
   */
  connectNodeToGraph(idNode: string, idGraph: string): Observable<any> {
    console.log('connectNodeToGraph ', idNode, ' ', idGraph);
    return this.apiService.createRelationBetween(idNode, idGraph, 'aNode');
  }

  /**
   * push a new Graph in the database
   * return the id of the new Graph
   * @param graph
   */
  createGraph(graph: Graph): Observable<string> {
    console.log('createGraph ', graph);
    graph['@class'] = 'Graph';
    delete graph.id;
    delete graph.nodes;
    delete graph.links;

    return this.apiService
      .createDocument(graph)
      .pipe(map((response) => this.apiService.documentId(response)));
  }

  /**
   * push a new Node in the database
   * return the new Node
   * @param node
   */
  createNode(node: Node, classe: string): Observable<Node> {
    console.log('createNode ', node);
    node['@class'] = classe;
    delete node.id;
    return this.apiService.createDocument(node).pipe(
      map((response) => {
        node.id = this.apiService.documentId(response);
        return node;
      })
    );
  }

  /**
   * create a node and link it to a graph
   * return the node ID
   * @param node
   * @param graph
   * @returns
   */
  addNodeToGraph(node: Node, graph: Graph): Observable<Node> {
    console.log('add node to graph');
    let request: Observable<Node>;
    if (node.type === NodeType.graph) {
      // create a graph node
      request = this.copyGraph(structuredClone(node as Graph), false);
    } else {
      // create a trend or event node
      request = this.createNode(
        structuredClone(node),
        [...node.type][0].toUpperCase() + node.type.slice(1) // TODO replace by classe name
      );
    }

    console.log('request ', request);
    return request.pipe(
      switchMap((newNode: Node) => {
        console.log('newNode ', newNode);
        return this.connectNodeToGraph(newNode.id, graph.id).pipe(
          map(() => newNode)
        );
      })
    );
  }

  /**
   * push a new Graph in the database
   *  duplicate all the nodes and link of the template graph
   * return the new Graph
   * @param node
   */
  copyGraph(graph: Graph, template): Observable<Graph> {
    console.log('copyGraph ', graph);
    if (template) graph.template = template;
    return this.createGraph(structuredClone(graph)).pipe(
      switchMap((idGraph: string) => {
        console.log('id new graph ', idGraph);
        return this.duplicateGraph(graph, idGraph);
      })
    );
  }

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
   * create a duplicate of all the node and link of the graph
   * @param graph
   * @returns
   */
  duplicateGraph(graphToCopy: Graph, idNewGraph: string): Observable<Graph> {
    graphToCopy.id = idNewGraph;
    console.log('duplicateGraph ', graphToCopy);

    // create new nodes and links
    if (graphToCopy.links.length > 0)
      return this.copyGraphNodes(graphToCopy).pipe(
        switchMap((indexesNode: Map<string, string>) => {
          return this.copyGraphLinks(graphToCopy, indexesNode).pipe(
            map(() => {
              graphToCopy.nodes.forEach((node: Node) => {
                node.id = indexesNode.get(node.id);
              });
              return graphToCopy;
            })
          );
        })
      );

    return this.copyGraphNodes(graphToCopy).pipe(
      map(() => {
        return graphToCopy;
      })
    );
  }

  /**
   * create the new nodes of a graph and add them to it
   * return an map of all the graph nodes ids
   * @param graph
   * @returns
   */
  copyGraphNodes(graph: Graph): Observable<Map<string, string>> {
    console.log('copyGraphNodes ', graph);
    let requests: Observable<Node>[];
    let indexesMap = new Map<string, string>();

    // add new nodes
    requests = graph.nodes.map((node: Node) =>
      this.addNodeToGraph(node, graph).pipe(
        map((newNode: Node) => {
          console.log('newNode ', newNode);
          console.log('[node.id, newNode.id] ', [node.id, newNode.id]);
          indexesMap.set(node.id, newNode.id);
          return newNode;
        })
      )
    );

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request),
      reduce((acc, cur) => [...acc, cur], []),
      map(() => {
        return indexesMap;
      })
    );
  }

  /**
   * create the new links of a graph
   * return a map of all the old and new id
   * @param graph
   * @returns
   */
  copyGraphLinks(
    graph: Graph,
    indexesNode: Map<string, string>
  ): Observable<Map<string, string>> {
    let requestsLinks: Observable<string[]>[] = [];
    let indexesMap = new Map<string, string>();

    graph.links.forEach((link) => {
      requestsLinks.push(
        this.apiService
          .createRelationBetweenWithProperty(
            indexesNode.get(link.in),
            indexesNode.get(link.out),
            'link',
            'trigger',
            link.trigger
          )
          .pipe(
            map((newId: string) => {
              return [link.id, newId];
            })
          )
      );
    });

    if (requestsLinks.length === 0) return of(); // s'il n'y a pas de nouveaux nodes à ajouter

    return forkJoin(requestsLinks).pipe(
      map((newLinkIndexes: string[][]) => {
        newLinkIndexes.map((indexes: string[]) => {
          indexesMap.set(indexes[0], indexes[1]);
        });

        return indexesMap;
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
      .createRelationBetweenWithProperty(idIn, idOut, 'link', 'trigger', `"${value}"`)
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
            this.createGraphNode(structuredClone(node as Graph)).pipe(
              map((graph: Graph) => graph.id)
            )
          );
        } else {
          // create a trend or event node
          requestsNode.push(
            this.createNode(
              structuredClone(node),
              [...node.type][0].toUpperCase() + node.type.slice(1)
            ).pipe(map((node: Node) => node.id))
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
          (indexNode: string) => this.connectNodeToGraph(indexNode, indexGraph)
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

  /**
   * group an ensemble of nodes from a graph
   * @param group
   * @param graph
   * @returns id of the new group and the start node
   */
  groupNodes(
    group: Graph,
    graph: Graph,
    linksIllegal: Link[]
  ): Observable<string[]> {
    return this.createGraph(structuredClone(group))
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

          requests.push(this.connectNodeToGraph(idGroup, graph.id));

          let requestsConnectNodes = group.nodes.map((node: Node) =>
            this.connectNodeToGraph(node.id, idGroup)
          );
          let requestsDisconnectNodes = group.nodes.map((node: Node) =>
            this.disconnectNodeFromGraph(node.id, graph.id)
          );

          let requestsDeleteLinks = linksIllegal.map((link: Link) =>
            this.deleteLink(link)
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

  ungroupNodes(group: Graph, graph: Graph): Observable<any[]> {
    let start = getElementByChamp<Node>(group.nodes, 'event', EventType.start);
    remove<Node>(group.nodes, start);
    let requestConnect = group.nodes.map((node: Node) =>
      this.connectNodeToGraph(node.id, graph.id)
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

  /**
   * delete a graph and all his nodes
   * @param graph
   * @returns
   */
  deleteGraph(graph: Graph): Observable<any> {
    console.log('deleteGraph ', graph);

    let requests = graph.nodes.map((node: Node) => {
      if (node.type === NodeType.graph) return this.deleteGraph(node as Graph);
      return this.apiService.deleteDocument(node.id);
    });

    requests.push(this.apiService.deleteDocument(graph.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }

  disconnectNodeFromGraph(idNode: string, idGraph: string): Observable<any> {
    return this.apiService.deleteRelationBetween(idNode, idGraph);
  }
}
