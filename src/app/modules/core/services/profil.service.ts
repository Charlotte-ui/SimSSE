import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {

  constructor(public firebaseService:FirebaseService) { }

  getProfilById(id:string): Observable<any|undefined> {
    return this.firebaseService.getElementInCollectionByIds("Profil",id);
}
}
