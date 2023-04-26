import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele } from '../models/modele';
import { Trend,Event,Link, NodeType, EventType, Graph } from '../models/node';

@Injectable({
  providedIn: 'root'
})
export class ModeleService {

  getGraph():Graph {
    let trend1 = new Trend("1",30,80,'chute sat','SpO2',-1)
    let trend2 = new Trend("2",15,60,'acc respi','FR',1)
    let event:Event = new Event("3",40,50,EventType.action,'oxygénothérapie')
    let start:Event = new Event("0",5,95,EventType.start,'start')


    let link1:Link = new Link("0",'oxygénothérapie',1,false);
    let link2:Link = new Link("1",'oxygénothérapie',2,false);
    let link3:Link = new Link("2",'start',1,true);
    let link4:Link = new Link("3",'start',2,true);



    let graph= new Graph("-1",0,0,"root",[start,trend1,trend2,event],[link1,link2,link3,link4],false,true)

    return graph;

  }

  constructor(public firebaseService:FirebaseService) { }



  getModeleById(id:string): Observable<Modele|undefined> {
    return this.firebaseService.getElementInCollectionByIds<Modele>("Modele",id);
  }

  createNewModel(modele:Modele,gabarit:boolean):Modele{
    return undefined;
    // TODOD
  }
}
