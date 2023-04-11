import { Injectable } from '@angular/core';
import { VariablePhysio } from '../models/variablePhysio';
import { Observable, of } from 'rxjs';
import { FirebaseService } from './firebase.service';

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
}
