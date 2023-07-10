import { Injectable } from '@angular/core';
import { Observable, concat, concatMap, forkJoin, from, map, of, reduce, switchMap, zipAll } from 'rxjs';
import { Modele } from '../models/vertex/modele';
import { ApiService } from './api.service';
import { Node, Graph, Link, EventType, NodeType, Event} from '../models/vertex/node';
import { Template } from '../models/interfaces/templatable';
import { NodeService } from './node.service';
import { Action, BioEvent } from '../models/vertex/event';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  constructor(private apiService: ApiService) {}


  /**
   * GETTERS --------------------------------------------
   */

    /**
   * READ
   */

  getGraphs(): Observable<Graph[]> {
    return this.apiService.getClasseElements<Graph>(Graph);
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


      getGraphLinks(arrayId: string[]): Observable<Link[] | undefined> {
    if (arrayId.length > 0)
      return this.apiService
        .getLinkFromMultiple(arrayId, 'link')
        .pipe(map((response) => Link.instanciateListe<Link>(response.result)));
    else return of();
  }

  /**
   * get all the nodes of a graph
   * @param id
   * @returns
   */
  getGraphNodes(id: string): Observable<Node[] | undefined> {
    return this.apiService.getRelationFrom(id, 'aNode', 'Graph').pipe(
      map((response) => {
        return Node.instanciateListe<Node>(response.result);
      })
    );
  }
  

  /**
   * return the modele from wich the graph is root
   * @param idGraph
   * @returns
   */
  getModeleGraph(idGraph: string): Observable<Modele | undefined> {
    return this.apiService
      .getRelationTo(idGraph, 'rootGraph', 'Graph')
      .pipe(map((response) => new Modele(response.result[0])));
  }

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

    /**
   * init all the nodes and links of a graph
   * recursive
   * take a graph in paramater and return a list of template to add to the nodes and a list of links to add to the graph
   * @param graph
   */
  initGraph(graph: Graph): Observable<[Template[], Link[]]> {
    return this.getGraphNodes(graph.id).pipe(
      switchMap((nodes: Node[]) => {
        nodes.map((node: Node) => graph.nodes.set(node.id, node));
        if (nodes.length > 0) {
          let nodeIDArray = nodes.map((node: Node) => node.id).filter((n) => n);
          const requestsTemplate = nodes.map((node: Node) => {
            if (
              node.type == NodeType.event &&
              (node as Event).typeEvent !== EventType.start
            ) {
              return this.getEventTemplate(
                (node as Event).event,
                (node as Event).typeEvent
              );
            } else if (node.type == NodeType.graph)
              return this.initGraph(node as Graph).pipe(
                map((result: [Template[], Link[]]) => {
                  this.initTemplateAndLinks(result, node as Graph);
                  return node as Graph;
                })
              );
            else return of(undefined);
          });
          const requestLink = this.getGraphLinks(nodeIDArray);
          return forkJoin([
            concat(requestsTemplate).pipe(zipAll()),
            requestLink,
          ]);
        } else return of(undefined);
      })
    );
  }

  /**
   * take a list of template, a liste of link, and a graph and bind the templates to the nodes and the links to the graph
   * @param result
   * @param graph
   */
  initTemplateAndLinks(result: [Template[], Link[]], graph: Graph) {
    // on attribiut leur template aux events et aux graph
    if (result) {
      Array.from(graph.nodes).map(([key, node], index: number) => {
        if (node['template']) node['template'] = result[0][index];
        if (node.type == NodeType.graph) {
          node['nodes'] = (result[0][index] as Graph).nodes;
          node['links'] = (result[0][index] as Graph).links;
          node['template'] = (result[0][index] as Graph).id;
        }
      });
      result[1].map((link: Link) => graph.links.set(link.id, link));
    }
  }


    /**
   * CREATE
   */

      /**
   * create a node and link it to a graph
   * return the node
   * @param node
   * @param graph
   * @returns
   */
  addNodeToGraph(node: Node, graph: Graph): Observable<Node> {
    console.log('add node to graph');
    let request: Observable<Node>;
    if (node.type === NodeType.graph) {
      // create a graph node
      request = this.copyGraph(
        structuredClone(node as Graph),
        false
      );
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
   * create a duplicate of all the node and link of the graph
   * @param graph
   * @returns
   */
  duplicateGraph(graphToCopy: Graph, idNewGraph: string): Observable<Graph> {
    graphToCopy.id = idNewGraph;
    console.log('duplicateGraph ', graphToCopy);

    // create new nodes and links
    if (graphToCopy.links.size > 0)
      return this.copyGraphNodes(graphToCopy).pipe(
        switchMap((indexesNode: Map<string, string>) => {
          return this.copyGraphLinks(graphToCopy, indexesNode).pipe(
            map((indexesLink: Map<string, string>) => {
              // bind the new node ids to the graph
              graphToCopy.nodes.forEach((node: Node) => {
                node.id = indexesNode.get(node.id);
              });
              // bind the new link in and out ids to the graph
              graphToCopy.links.forEach((link: Link) => {
                link.id = indexesLink.get(link.id);
                link.out = indexesNode.get(link.out);
                link.in = indexesNode.get(link.in);
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
    requests = Array.from(graph.nodes).map(([key, node]) =>
      this.addNodeToGraph(node, graph).pipe(
        map((newNode: Node) => {
          console.log('newNode ', newNode);
          console.log('[node.id, newNode.id] ', [key, newNode.id]);
          indexesMap.set(key, newNode.id);
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
    let requests: Observable<string[]>[] = [of()];
    let indexesMap = new Map<string, string>();

    requests = Array.from(graph.links).map(([key, link]) =>
      this.apiService
        .createRelationBetweenWithProperty(
          indexesNode.get(link.in),
          indexesNode.get(link.out),
          'link',
          'trigger',
          link.trigger
        )
        .pipe(
          map((res: any) => {
            let newLink = new Link(res.result[0]);
            indexesMap.set(key, newLink.id);
            return [key, newLink.id];
          })
        )
    );

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request),
      reduce((acc, cur) => [...acc, cur], []),
      map((newLinkIndexes: string[][]) => {
        newLinkIndexes.map((indexes: string[]) => {
          indexesMap.set(indexes[0], indexes[1]);
        });
        return indexesMap;
      })
    );
  }


   /**
   * UPDATER --------------------------------------------
   */

   /* updateGraph(
    graph: Graph,
    nodeToUpdate: string[],
    nodeToDelete: string[],
    linkToUpdate: string[],
    linkToDelete: string[]
  ): Observable<any> {
    let requests: Observable<any>[] = [];
    // create new nodes and links
    let requestCreate = this.updateGraphNodes(graph)
      .pipe
         switchMap((indexesNode: string[]) => {
        return this.updateGraphLinks(graph, indexesNode);
      }) 
      ();
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
  } */

  
  /**
   * create the new nodes of a graph and add them to it
   * return an array of all the graph nodes
   * @param graph
   * @returns
   */
  /* updateGraphNodes(graph: Graph): Observable<string[]> {
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
  } */

   /**
   * DELETER ----------------------------------------------
   */

    /**
   * delete a graph and all his nodes
   * @param graph
   * @returns
   */
  deleteGraph(graph: Graph): Observable<any> {
    console.log('deleteGraph ', graph);

    let requests = Array.from(graph.nodes).map(([key, node]) => {
      if (node.type === NodeType.graph) return this.deleteGraph(node as Graph);
      return this.apiService.deleteDocument(key);
    });

    requests.push(this.apiService.deleteDocument(graph.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }




}
