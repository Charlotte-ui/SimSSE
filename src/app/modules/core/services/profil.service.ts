import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { FirebaseService } from './firebase.service';
import { Profil } from '../models/profil';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {

  constructor(public firebaseService:FirebaseService) { }
  getProfilById(id:string): Observable<Profil|undefined> {
    return this.firebaseService.getElementInCollectionByIds("Profil",id);
  }

  updateProfil(profil:Profil){
    // TODO update bdd
  }
}
