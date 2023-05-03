import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { FirebaseService } from './firebase.service';
import { Profil } from '../models/profil';
import { ApiService } from './api.service';
import { map } from 'rxjs';
import { VariablePhysioInstance } from '../models/variablePhysio';

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

}
