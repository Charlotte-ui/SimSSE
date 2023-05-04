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
} from '../models/node';
import { Observable, map, of } from 'rxjs';
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
}
