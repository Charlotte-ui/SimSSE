import { Injectable } from '@angular/core';
import { VariablePhysio, VariablePhysioGabarit } from '../models/variablePhysio';
import { Observable, of } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Trend,Event,Node, Link, BioEvent, Action, Graph } from '../../core/models/node';


@Injectable({
  providedIn: 'root'
})
export class RegleService {

  constructor(firebaseService:FirebaseService) {}

  getVariableGarbarit(): Observable<VariablePhysioGabarit[]> {
    let SpO2:VariablePhysioGabarit = {
      id:"0",
      name:"SpO2",
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
      name:"FR",
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
      name:"FC",
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
      name:"HemoCue",
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
      name:"PAD",
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
      name:"PAS",
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
      name:"Temp",
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



  getBioEvents(): Observable<BioEvent[]> {
    let oxy:BioEvent = {
      name: "mort",
      id: "mort",
    }

    let garrot:BioEvent = {
      name: "arrêt cardio-vasculaire",
      id: "arrêt cardio-vasculaire",
    }

    let hypox:BioEvent = {
      name: "hypoxémie",
      id: "hypoxémie",
    }

    let events = [oxy,garrot,hypox];

    return of(events);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  getActions(): Observable<Action[]> {
    let oxy:Action = {
      name: "oxygénothérapie",
      id: "oxygénothérapie",
    }

    let garrot:Action = {
      name: "garrot",
      id: "garrot",
    }

    let pls:Action = {
      name: "pls",
      id: "pls",
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
