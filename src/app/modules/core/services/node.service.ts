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
      type:NodeType.link,
      cible:'SpO2',
      pente:-1,
      state:false
    }

    let trend2:Trend = {
      id:"2",
      name: 'acc respi',
      x: 15,
      y: 60,
      type:NodeType.link,
      cible:'FR',
      pente:1,
      state:false
    }
    let event:Event = {
      id:"3",
      name: 'Oxygéno.',
      x: 40,
      y: 50,
      type: NodeType.event,
      typeEvent:EventType.action,
      event:'oxygénothérapie',
      state:false
    }

    let start:Event = {
      id:"0",
      name: 'Start',
      x: 5,
      y: 95,
      type:NodeType.event,
      typeEvent:EventType.start,
      event:'start',
      state:false
    }

    let end:Event = {
      id:"4",
      name: 'End',
      x: 95,
      y: 95,
      type:NodeType.event,
      typeEvent:EventType.start,
      event:'end',
      state:false
    }

    let link1:Link = {
      id:"0",
      source: 3,
      target: 1,
      type:"link",
      start:false
    }

    let link2:Link = {
      id:"1",
      source: 3,
      target: 2,
      type:"link",
      start:false
    }

    let link3:Link = {
      id:"2",
      source: 0,
      target: 1,
      type:"link",
      start:true
    }

    let link4:Link = {
      id:"3",
      source: 0,
      target: 2,
      type:"link",
      start:true
    }

    let link5:Link = {
      id:"4",
      source: 3,
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
      state:false
    }

    return of ([graph])
  }
}
