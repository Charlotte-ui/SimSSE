import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele } from '../models/modele';
import { Trend,Event,Link, NodeType, EventType, Graph } from '../models/node';

@Injectable({
  providedIn: 'root'
})
export class ModeleService {

  getGraph(modele: Modele):Graph {
    let trend1:Trend = {
      id:"1",
      name: 'chute sat',
      x: 30,
      y: 80,
      type: NodeType.trend,
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
      type:NodeType.event,
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

    let graph: Graph ={
      gabarit:false,
      id:"-1",
      links:[link1,link2,link3,link4],
      name:"root",
      nodes:[start,trend1,trend2,event],
      root:true,
      state:true,
      type:NodeType.graph,
      x:undefined,
      y:undefined,
      triggeredEvents:[[0, 'start'], [50, 'oxygénothérapie']]
    }

    return graph;

  }

  constructor(public firebaseService:FirebaseService) { }



  getModeleById(id:string): Observable<Modele|undefined> {
    return this.firebaseService.getElementInCollectionByIds<Modele>("Modele",id);
  }

  createNewModel(modele:Modele,gabarit:boolean){
    // TODOD
  }
}
