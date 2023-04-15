import { Injectable } from '@angular/core';
import { VariablePhysio, VariablePhysioGabarit } from '../models/variablePhysio';
import { Observable, of } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Trend,Event,Node, Link } from '../../core/models/node';


@Injectable({
  providedIn: 'root'
})
export class RegleService {

  constructor(firebaseService:FirebaseService) {}

  getVariableGarbarit(): Observable<VariablePhysioGabarit[]> {
    let SpO2:VariablePhysioGabarit = {
      id:"0",
      nom:"SpO2",
      rand:1,
      min:0,
      max:100,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }

    let FR:VariablePhysioGabarit = {
      id:"1",
      nom:"FR",
      rand:1,
      min:0,
      max:100,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }

    let FC:VariablePhysioGabarit = {
      id:"2",
      nom:"FC",
      rand:1,
      min:0,
      max:100,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }

    let HemoCue:VariablePhysioGabarit = {
      id:"3",
      nom:"HemoCue",
      rand:1,
      min:0,
      max:100,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }

    let PAD:VariablePhysioGabarit = {
      id:"4",
      nom:"PAD",
      rand:1,
      min:0,
      max:100,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }

    let PAS:VariablePhysioGabarit = {
      id:"5",
      nom:"PAS",
      rand:1,
      min:0,
      max:200,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }

    let Temp:VariablePhysioGabarit = {
      id:"6",
      nom:"Temp",
      rand:1,
      min:0,
      max:100,
      couleur:"",
      moyennesAge:[90,91,92,93,94,95,96,97,98,99],
      moyennesSexe:[95,95],
      sdAge:1,
      sdSexe:1
    }


    let variables = [SpO2,FR,FC,HemoCue,Temp,PAD,PAS];

    return of(variables);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }



  getEventGabarit(): Observable<Partial<Event>[]> {
    let oxy:Partial<Event> = {
      event: "oxygénothérapie",
    }

    let garrot:Partial<Event> = {
      event: "garrot",
    }

    let pls:Partial<Event> = {
      type: "event",
    }

    let events = [oxy,garrot,pls];

    return of(events);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  createVariable(variable:VariablePhysio){

  }

  createEvent(event:Event){

  }


}
