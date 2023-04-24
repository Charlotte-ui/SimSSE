import { Injectable } from '@angular/core';
import { Trend,Event, Link, Graph, NodeType ,EventType} from '../models/node';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NodeService {


  constructor() { }

  getGraphGabarit() {
    let trend1:Trend = {
      id:"1",
      name: 'chute sat',
      x: 30,
      y: 80,
      type:NodeType.trend,
      cible:'SpO2',
      pente:-1,
      state:false
    }

    let trend2:Trend = {
      id:"2",
      name: 'acc respi',
      x: 15,
      y: 60,
      type:NodeType.trend,
      cible:'FR',
      pente:1,
      state:false
    }
    let event:Event = {
      id:"3",
      x: 40,
      y: 50,
      type: NodeType.event,
      typeEvent:EventType.action,
      event:'oxygénothérapie',
      state:false
    }

    let start:Event = {
      id:"0",
      x: 5,
      y: 95,
      type:NodeType.event,
      typeEvent:EventType.start,
      event:'start',
      state:false
    }

    let end:Event = {
      id:"4",
      x: 95,
      y: 95,
      type:NodeType.event,
      typeEvent:EventType.start,
      event:'end',
      state:false
    }

    let link1:Link = {
      id:"0",
      source: 'oxygénothérapie',
      target: 1,
      type:"link",
      start:false
    }

    let link2:Link = {
      id:"1",
      source: 'oxygénothérapie',
      target: 2,
      type:"link",
      start:false
    }

    let link3:Link = {
      id:"2",
      source: 'start',
      target: 1,
      type:"link",
      start:true
    }

    let link4:Link = {
      id:"3",
      source: 'start',
      target: 2,
      type:"link",
      start:true
    }

    let link5:Link = {
      id:"4",
      source: 'oxygénothérapie',
      target: 4,
      type:"link",
      start:true
    }

    let graph:Graph = {
      gabarit:true,
      links:[link1,link2,link3,link4,link5],
      nodes:[start,trend1,trend2,event,end],
      name:"detresse respiratoire",
      x:50,
      y:50,
      id:"0",
      type:NodeType.graph,
      state:false,
      root:false,
      triggeredEvents:undefined
    }

    return of ([graph])
  }
}
