import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele } from '../models/modele';

@Injectable({
  providedIn: 'root'
})
export class ModeleService {

  constructor(public firebaseService:FirebaseService) { }



  getModeleById(id:string): Observable<Modele|undefined> {
    return this.firebaseService.getElementInCollectionByIds<Modele>("Modele",id);
}
}
