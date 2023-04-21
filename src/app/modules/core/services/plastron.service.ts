import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Plastron } from '../models/plastron';
import { Modele } from '../models/modele';
import { VariablePhysioInstance } from '../models/variablePhysio';
import { Scenario } from '../models/scenario';

@Injectable({
  providedIn: 'root'
})
export class PlastronService {


  getVariablesCibles(plastron: Plastron): Observable<VariablePhysioInstance[]> {
    let SpO2:VariablePhysioInstance = {
      id:"0",
      name:"SpO2",
      rand:1,
      min:0,
      max:100,
      couleur:"#5470c5",
      cible:98
    }

    let FR:VariablePhysioInstance = {
      id:"1",
      name:"FR",
      rand:1,
      min:0,
      max:100,
      couleur:"#5470c5",
      cible:16
    }

    let FC:VariablePhysioInstance = {
      id:"2",
      name:"FC",
      rand:1,
      min:0,
      max:100,
      couleur:"#5470c5",
      cible:80
    }

    let HemoCue:VariablePhysioInstance = {
      id:"3",
      name:"HemoCue",
      rand:1,
      min:0,
      max:100,
      couleur:"#e66",
      cible:36
    }

    let PAD:VariablePhysioInstance = {
      id:"4",
      name:"PAD",
      rand:1,
      min:0,
      max:100,
      couleur:"#5470c5",
      cible:80
    }

    let PAS:VariablePhysioInstance = {
      id:"5",
      name:"PAS",
      rand:1,
      min:0,
      max:200,
      couleur:"#fc8451",
      cible:130
    }

    let Temp:VariablePhysioInstance = {
      id:"6",
      name:"Temp",
      rand:1,
      min:0,
      max:100,
      couleur:"#5470c5",
      cible:27
    }


    let variables = [SpO2,FR,FC,HemoCue,Temp,PAD,PAS];

    return of(variables);
  }

  changeModelRef(plastron: Plastron, newModele: Modele) {
    throw new Error('Method not implemented.');
  }

  getScenario(plastron: Plastron): Observable<Scenario> {

    let scenario={titre:"Incendie à la clinique des Chaumes",id:"5WHFhoZFHCodDPvKqi62"} as Scenario;

    return of(scenario);
  }

  constructor() { }
}
