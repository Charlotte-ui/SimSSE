import { Injectable } from '@angular/core';
import {
  VariablePhysio,
  VariablePhysioTemplate,
} from '../models/variablePhysio';
import { Observable, of } from 'rxjs';
import { FirebaseService } from './firebase.service';
import {
  Trend,
  Event,
  Node,
  Link,
  BioEvent,
  Action,
  Graph,
} from '../../core/models/node';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class RegleService {

  constructor(firebaseService: FirebaseService, private apiService:ApiService) {}

  getVariableTemplate(): Observable<VariablePhysioTemplate[]> {
    return this.apiService.getClasseElements<VariablePhysioTemplate>(VariablePhysioTemplate);

  }

  getBioEvents(): Observable<BioEvent[]> {
    return this.apiService.getClasseElements(BioEvent)

    /* let oxy: BioEvent = {
      name: 'mort',
      id: 'mort',
    };

    let garrot: BioEvent = {
      name: 'arrêt cardio-vasculaire',
      id: 'arrêt cardio-vasculaire',
    };

    let hypox: BioEvent = {
      name: 'hypoxémie',
      id: 'hypoxémie',
    };

    let events = [oxy, garrot, hypox];

    return of(events);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario"); */
  }

  getActions(): Observable<Action[]> {
    return this.apiService.getClasseElements(Action)

   /*  let oxy: Action = {
      name: 'oxygénothérapie',
      id: 'oxygénothérapie',
    };

    let garrot: Action = {
      name: 'garrot',
      id: 'garrot',
    };

    let pls: Action = {
      name: 'pls',
      id: 'pls',
    }; 

    let events = [oxy, garrot, pls];

    return of(events); */
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  getAllTagsPlastron(): Observable<string[]> {
    let tags = [
      'UA',
      'EU',
      'UR',
      'respiratoire',
      'arme de guerre',
      'polytraumatisme',
      'trauma fermé',
      'trauma ouvert',
    ];
    return of(tags);
  }

  getAllTagsScenario(): Observable<string[]> {
    let tags = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
    return of(tags);
  }

  createVariable(variable: VariablePhysio) {}

  createEvent(event: Event) {}

  createAction(event: any) {
    throw new Error('Method not implemented.');
  }
  createBioEvent(event: any) {
    throw new Error('Method not implemented.');
  }
}
