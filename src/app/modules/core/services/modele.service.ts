import { Injectable } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele } from '../models/vertex/modele';
import { Trend, Event, Link, NodeType, EventType, Graph,Node } from '../models/vertex/node';
import { ApiService } from './api.service';
import { VariablePhysioInstance } from '../models/vertex/variablePhysio';
import { NodeService } from './node.service';

@Injectable({
  providedIn: 'root',
})
export class ModeleService {
  updateModele(modele: Modele): Observable<any> {
    throw new Error('Method not implemented.');
  }
  
  constructor(
    public firebaseService: FirebaseService,
    public apiService: ApiService,
    public nodeService:NodeService
  ) {}

  getModeleById(id: string): Observable<Modele | undefined> {
    return this.apiService
      .getDocument(id)
      .pipe(map((response) => new Modele(response)));
    //return this.firebaseService.getElementInCollectionByIds<Modele>("Modele",id);
  }

  getModeleByLink(link): Observable<Modele | undefined> {
    return this.getModeleById(link['in'].substring(1));
  }



  getGraph(id:string): Observable<Graph | undefined> {
    /* let trend1 = new Trend('1', 30, 80, 'chute sat', 'SpO2', -1);
    let trend2 = new Trend('2', 15, 60, 'acc respi', 'FR', 1);
    let event: Event = new Event(
      '3',
      40,
      50,
      EventType.action,
      'oxygénothérapie'
    );
    let start: Event = new Event('0', 5, 95, EventType.start, 'start');

    let link1: Link = new Link('0', 'oxygénothérapie', 1, false);
    let link2: Link = new Link('1', 'oxygénothérapie', 2, false);
    let link3: Link = new Link('2', 'start', 1, true);
    let link4: Link = new Link('3', 'start', 2, true);

    let graph = new Graph(
      '-1',
      0,
      0,
      'root',
      [start, trend1, trend2, event],
      [link1, link2, link3, link4],
      false,
      true
    );
 */
    return this.apiService.getRelationFrom(id,"rootGraph","Modele")
    .pipe(map(response => new Graph(response.result[0])))
  }

  getGraphNodes(id:string): Observable<Node[] | undefined>{
    return this.apiService.getRelationFrom(id,"aNode","Graph")
    .pipe(map(response => (Node.instanciateListe<Node>(response.result))))
  }

    getTrigger(id:string): Observable<any | undefined>{
    return this.apiService.getLinkAndRelationFrom(id,"triggeredAt","Modele")
    .pipe(map(response => (response.result[0])))
  }

    getGraphLinks(arrayId:string[]): Observable<Link[] | undefined>{
    return this.apiService.getLinkFromMultiple(arrayId,"link")
    .pipe(map(response => (Link.instanciateListe<Link>(response.result))))
  }


  /**
 * push a new Modele in the database
 * return the id of the new Modele
 * @param modele 
 */
createModele(modele: Modele, template: boolean):Observable<string>{
  modele["@class"] = "Modele";
  modele["template"] = template;
  delete modele.id;
  delete modele.tags;
  delete modele.graph;
  delete modele.triggeredEvents;
  return this.apiService.createDocument(modele)
  .pipe(map(response => this.apiService.documentId(response)))
  .pipe(switchMap((idModele:string)=>{
    this.nodeService.createGraph(new Graph({template:true,name:'root'})).subscribe()
    return of(idModele)
  }));
}
}
