import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { FirebaseService } from './firebase.service';
import { Profil } from '../models/vertex/profil';
import { ApiService } from './api.service';
import { map } from 'rxjs';
import { VariablePhysioInstance } from '../models/vertex/variablePhysio';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {

  constructor(public firebaseService:FirebaseService,public apiService:ApiService) { }
  getProfilById(id:string): Observable<Profil|undefined> {
    return this.apiService.getDocument(id)
    .pipe(map(response => (new Profil(response))))
  //  return this.firebaseService.getElementInCollectionByIds("Profil",id);
  }

  updateProfil(profil:Profil){
    // TODO update bdd
  }

    getVariable(idProfil, idVariableTemplate) : Observable<VariablePhysioInstance | undefined> {
    return this.apiService.getVariable(idProfil, idVariableTemplate)
    .pipe(map((response) => new VariablePhysioInstance(response.result[0]["intersect($a, $b)"][0])));
  }

        /**
   * push a new Profil in the database
   * return the id of the new Profil
   * @param profil 
   */
    createProfil(profil: Profil):Observable<Profil>{
      profil["@class"] = "Profil";
      delete profil.id;
      delete profil.targetVariable;
      return this.apiService.createDocument(profil)
      .pipe(map(response => new Profil(response)));
    }

}
