import { Injectable } from '@angular/core';
import { VariablePhysio } from '../models/variablePhysio';
import { Observable, of } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Trend,Event,Node, Link } from '../../core/models/node';


@Injectable({
  providedIn: 'root'
})
export class RegleService {

  constructor(firebaseService:FirebaseService) {}

  getVariables(): Observable<VariablePhysio[]> {
    let SpO2:VariablePhysio = {
      id:"0",
      nom:"SpO2",
      cible:98,
      rand:1,
      min:0,
      max:100,
      couleur:""
    }

    let FR:VariablePhysio = {
      id:"1",
      nom:"FR",
      cible:16,
      rand:1,
      min:0,
      max:100,
      couleur:""
    }

    let FC:VariablePhysio = {
      id:"2",
      nom:"RC",
      cible:80,
      rand:1,
      min:0,
      max:100,
      couleur:""
    }

    let HemoCue:VariablePhysio = {
      id:"3",
      nom:"HemoCue",
      cible:36,
      rand:1,
      min:0,
      max:100,
      couleur:""
    }

    let PAD:VariablePhysio = {
      id:"4",
      nom:"PAD",
      cible:80,
      rand:1,
      min:0,
      max:100,
      couleur:""
    }

    let PAS:VariablePhysio = {
      id:"5",
      nom:"PAS",
      cible:130,
      rand:1,
      min:0,
      max:200,
      couleur:""
    }

    let Temp:VariablePhysio = {
      id:"6",
      nom:"Temp",
      cible:27,
      rand:1,
      min:0,
      max:100,
      couleur:""
    }


    let variables = [SpO2,FR,FC,HemoCue,Temp,PAD,PAS];

    return of(variables);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  getEvents(): Observable<Event[]> {
    let oxy:Event = {
      name: "oxygénothérapie",
      event: "oxygénothérapie",
      x: 0,
      y: 0,
      type: "event",
      id:"0"
    }

    let garrot:Event = {
      name: "garrot",
      event: "garrot",
      x: 0,
      y: 0,
      type: "event",
      id:"1"
    }

    let pls:Event = {
      name: "pls",
      event: "pls",
      x: 0,
      y: 0,
      type: "event",
      id:"2"
    }



    let events = [oxy,garrot,pls];

    return of(events);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }
}
