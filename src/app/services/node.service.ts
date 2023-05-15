import { Injectable } from '@angular/core';
import {
  Trend,
  Event,
  Link,
  Graph,
  NodeType,
  EventType,
  Action,
  BioEvent,
  Node,
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
} from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  constructor(private apiService: ApiService) {}

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

  getGraphTemplate(): Observable<Graph[]> {
    return this.apiService.getClasseElementsWhithMatchingChamp<Graph>(
      Graph,
      'template',
      'true'
    );

    /*      let trend1 = new Trend("1",30,80,'chute sat','SpO2',-1)
    let trend2 = new Trend("2",15,60,'acc respi','FR',1)
    let event:Event = new Event("3",40,50,EventType.action,'oxygénothérapie')
    let start:Event = new Event("0",5,95,EventType.start,'start')
    let end:Event = new Event("4",95,95,EventType.start,'end')


    let link1:Link = new Link("0",'oxygénothérapie',1,false);
    let link2:Link = new Link("1",'oxygénothérapie',2,false);
    let link3:Link = new Link("2",'start',1,true);
    let link4:Link = new Link("3",'start',2,true);

    let link5:Link = new Link("4",'oxygénothérapie',4,true);


    let graph= new Graph("0",50,50,"detresse respiratoire",[start,trend1,trend2,event,end],[link1,link2,link3,link4,link5],true,false)

    return of ([graph]) */
  }

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
    console.log('createGraph');
    console.log(graph);
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

    console.log('create node');
    console.log(node);

    return this.apiService
      .createDocument(node)
      .pipe(map((response) => this.apiService.documentId(response)));
  }

  /**
   * push a  Node in the database
   * @param node
   */
  updateNode(node: Node): Observable<string[]> {
    let requests: Observable<any>[] = [];
    Object.keys(node).forEach((key) => {
      requests.push(
        this.apiService.updateDocumentChamp(node.id, key, "'" + node[key] + "'")
      );
    });
    if (requests.length > 0)
      return from(requests).pipe(
        concatMap((request: Observable<any>) => request)
      );
    else return of([]);
  }

  /**
   * push a  Node in the database
   * @param node
   */
  updateLink(link: Link): Observable<string[]> {
   
    return this.apiService.updateDocumentChamp(link.id, "start", "'" + link.start + "'")
    
  }

  updateGraph(
    graph: Graph,
    nodeToUpdate: string[],
    nodeToDelete: string[],
    linkToUpdate: string[],
    linkToDelete: string[]
  ): Observable<any> {
    let requests = [];

    // create new nodes and links
    let requestCreate = this.updateGraphNodes(graph).pipe(
      switchMap((indexesNode: string[]) => {
        console.log('indexesNode ', indexesNode);
        return this.updateGraphLinks(graph, indexesNode);
      })
    );

    requests.push(requestCreate);

    //update old nodes
    graph.nodes.forEach((node) => {
      if (!this.isNew(node.id) && nodeToUpdate.includes(node.id))
        requests.push(this.updateNode(node));
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
      requests.push(this.apiService.deleteDocument(linkId));
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
    console.log('updateGraphNodes');
    let indexGraph = graph.id;
    let requestsNode: Observable<any>[] = [];
    let oldNodeInddexes = [];

    // add new nodes
    graph.nodes.forEach((node) => {
      if (this.isNew(node.id))
        requestsNode.push(
          this.createNode(
            structuredClone(node),
            node.type == NodeType.trend ? 'Trend' : 'Event'
          )
        );
      else {
        // si le node est déjà présent
        oldNodeInddexes.push(node.id);
      }
    });

    if (requestsNode.length === 0) return of(oldNodeInddexes); // s'il n'y a pas de nouveaux nodes à ajouter

    return forkJoin(requestsNode).pipe(
      switchMap((newNodeIndexes: string[]) => {
        console.log('nodeIndexes ', newNodeIndexes);

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
          map((res: any[]) => {
            console.log('Response is ', res);

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
    console.log('updateGraphLinks');

    let requestsLinks: Observable<string>[] = [];

    graph.links.forEach((link) => {
      if (this.isNew(link.id))
        requestsLinks.push(
          this.apiService.createRelationBetweenWithProperty(
            this.getNodeId(link.in, graph.nodes, indexesNode),
            this.getNodeId(link.out, graph.nodes, indexesNode),
            'link',
            'start',
            "'" + link.start + "'"
          )
        );
    });

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
    console.log('value ', value);
    nodes.forEach((node: Node, index: number) => {
      console.log('node ', node);
      if (value == node.id || value == (node as Event).event)
        res = indexesNode[index];
    });
    return res;
  }
}
