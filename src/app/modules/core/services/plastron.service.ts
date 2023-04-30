import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Plastron } from '../models/plastron';
import { Modele } from '../models/modele';
import { VariablePhysioInstance } from '../models/variablePhysio';
import { Scenario } from '../models/scenario';
import { Groupe } from '../models/groupe';
import { ApiService } from './api.service';
import { ModeleService } from './modele.service';
import { Profil } from '../models/profil';

@Injectable({
  providedIn: 'root'
})
export class PlastronService {

  constructor(public apiService:ApiService, public modeleService:ModeleService) { }
  getVariablesCibles(plastron: Plastron): Observable<VariablePhysioInstance[]> {
    let SpO2 = new VariablePhysioInstance("0",1,"SpO2",0,100,"#5470c5",98)
    let FR = new VariablePhysioInstance("1",1,"FR",0,100,"#5470c5",16)
    let FC = new VariablePhysioInstance("2",1,"FC",0,100,"#5470c5",80)
    let HemoCue = new VariablePhysioInstance("3",1,"HemoCue",0,100,"#5470c5",36)
    let PAD = new VariablePhysioInstance("4",1,"PAD",0,100,"#5470c5",80)
    let PAS = new VariablePhysioInstance("5",1,"PAS",0,100,"#5470c5",130)
    let Temp = new VariablePhysioInstance("6",1,"Temp",0,100,"#5470c5",27)


    let variables = [SpO2,FR,FC,HemoCue,Temp,PAD,PAS];

    return of(variables);
  }

  changeModelRef(plastron: Plastron, newModele: Modele) {
   //
  }

  getScenario(plastron: Plastron): Observable<Scenario> {

    let scenario={title:"Incendie à la clinique des Chaumes",id:"5WHFhoZFHCodDPvKqi62"} as Scenario;

    return of(scenario);
  }

  updatePlastron(plastron:Plastron) : Modele{
    return undefined;
  }

  getPlastronByLink(link): Observable<Plastron|undefined> {
    return this.getPlastronById(link['in'].substring(1));
     // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
  }

  getPlastronById(id): Observable<Plastron|undefined> {
    return this.apiService.getDocument(id)
    .pipe(map(response => (new Plastron(response))))
     // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
  }

  getGroupeLink(id:string): Observable<any[]> {
    return this.apiService.getRelationTo(id,"seComposeDe");
  }

  /**
   * renvoi le modele associé au plastron
   * @param idPlastron 
   * @returns 
   */
  getPlastronModele(idPlastron:string): Observable<Modele|undefined> {
    return this.apiService.getRelationFrom2(idPlastron,"aModele","Plastron")
    .pipe(map(response => new Modele(response.result[0])))
    //return this.modeleService.getModeleByLink(link['in'].substring(1));
     // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
  }

    /**
   * renvoi le profil associé au plastron
   * @param idPlastron 
   * @returns 
   */
    getPlastronProfil(idPlastron:string): Observable<Profil|undefined> {
      return this.apiService.getRelationFrom2(idPlastron,"aProfil","Plastron")
      .pipe(map(response => new Profil(response.result[0])))
    }


}
