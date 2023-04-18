import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele } from '../models/modele';
import { Trend,Event,Link } from '../models/node';

@Injectable({
  providedIn: 'root'
})
export class ModeleService {

  getGraph(modele: Modele) {
    let trend1:Trend = {
      id:"1",
      name: 'chute sat',
      x: 30,
      y: 80,
      type:'trend',
      cible:'SpO2',
      pente:-1,
      state:false
    }

    let trend2:Trend = {
      id:"2",
      name: 'acc respi',
      x: 15,
      y: 60,
      type:'trend',
      cible:'FR',
      pente:1,
      state:false
    }
    let event:Event = {
      id:"3",
      name: 'Oxygéno.',
      x: 40,
      y: 50,
      type:'event',
      event:'oxygénothérapie',
      state:false
    }

    let start:Event = {
      id:"0",
      name: 'Start',
      x: 5,
      y: 95,
      type:'start',
      event:'start',
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

    return [[start,trend1,trend2,event],[link1,link2,link3,link4]]

  }

  constructor(public firebaseService:FirebaseService) { }



  getModeleById(id:string): Observable<Modele|undefined> {
    return this.firebaseService.getElementInCollectionByIds<Modele>("Modele",id);
  }

  createNewModel(modele:Modele,gabarit:boolean){
    // TODOD
  }
}
