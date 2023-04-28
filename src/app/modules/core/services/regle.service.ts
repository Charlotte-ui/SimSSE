import { Injectable } from '@angular/core';
import {
  VariablePhysio,
  VariablePhysioGabarit,
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

@Injectable({
  providedIn: 'root',
})
export class RegleService {
  constructor(firebaseService: FirebaseService) {}

  getVariableGarbarit(): Observable<VariablePhysioGabarit[]> {
    let SpO2 = new VariablePhysioGabarit(
      '0',
      1,
      'SpO2',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );
    let FR = new VariablePhysioGabarit(
      '1',
      1,
      'FR',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );
    let FC = new VariablePhysioGabarit(
      '2',
      1,
      'FC',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );
    let HemoCue = new VariablePhysioGabarit(
      '3',
      1,
      'HemoCue',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );
    let PAD = new VariablePhysioGabarit(
      '4',
      1,
      'PAD',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );
    let PAS = new VariablePhysioGabarit(
      '5',
      1,
      'PAS',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );
    let Temp = new VariablePhysioGabarit(
      '6',
      1,
      'Temp',
      0,
      100,
      '',
      [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
      1
    );

    let variables = [SpO2, FR, FC, HemoCue, Temp, PAD, PAS];

    return of(variables);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  getBioEvents(): Observable<BioEvent[]> {
    let oxy: BioEvent = {
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
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  getActions(): Observable<Action[]> {
    let oxy: Action = {
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

    return of(events);
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
