import { Injectable } from '@angular/core';
import { Trend,Event, Link, Graph } from '../models/node';
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
      x: 300,
      y: 300,
      type:'trend',
      cible:'SpO2',
      pente:-1
    }

    let trend2:Trend = {
      id:"2",
      name: 'acc respi',
      x: 500,
      y: 100,
      type:'trend',
      cible:'FR',
      pente:1
    }
    let event:Event = {
      id:"3",
      name: 'Oxygéno.',
      x: 550,
      y: 100,
      type:'event',
      event:'oxygénothérapie'
    }

    let start:Event = {
      id:"0",
      name: 'Start',
      x: 0,
      y: 0,
      type:'event',
      event:'start'
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

    let graph:Graph = {
      gabarit:true,
      links:[link1,link2,link3,link4],
      nodes:[start,trend1,trend2,event],
      name:"detresse respiratoire",
      x:50,
      y:50,
      id:"0",
      type:"graph"
    }

    return of ([graph])
  }
}
