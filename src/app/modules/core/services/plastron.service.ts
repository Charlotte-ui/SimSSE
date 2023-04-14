import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Plastron } from '../models/plastron';
import { Modele } from '../models/modele';

@Injectable({
  providedIn: 'root'
})
export class PlastronService {

  changeModelRef(plastron: Plastron, newModele: Modele) {
    throw new Error('Method not implemented.');
  }

  constructor() { }
}
