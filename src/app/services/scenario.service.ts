import { Injectable } from '@angular/core';
import { Observable, delay, forkJoin, map, of, switchMap, zipAll } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Scenario } from '../models/vertex/scenario';
import { Groupe } from '../models/vertex/groupe';
import { Plastron } from '../models/vertex/plastron';
import { ApiService } from './api.service';
import { TagService } from './tag.service';
import { Tag } from '../models/vertex/tag';

@Injectable({
  providedIn: 'root',
})
export class ScenarioService {
  constructor(
    public firebaseService: FirebaseService,
    public apiService: ApiService,
    public tagService: TagService
  ) {}

  getScenarios(): Observable<Scenario[]> {
    return this.apiService.getClasseElements<Scenario>(Scenario);
    //return this.firebaseService.getCollectionById<Scenario>("Scenario");
  }

  getScenarioById(id: string): Observable<Scenario | undefined> {
    return this.apiService
      .getDocument(id)
      .pipe(map((response) => new Scenario(response)));
  }

  initTags(scenario: Scenario): Observable<Tag[]> {
    return this.tagService.getTags(scenario.id, 'Scenario');
  }

  initGroupe(scenario: Scenario): Observable<any> {
    return this.getScenarioGroupes(scenario.id);
  }

  /**
   * push a new Scenario in the database
   * return the id of the new Scenario
   * @param scenario
   */
  createScenario(scenario: Scenario): Observable<string> {
    scenario['@class'] = 'Scenario';
    delete scenario.id;
    delete scenario.tags;

    return this.apiService
      .createDocument(scenario)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((idScenario: string) =>
          this.createGroupe(
            new Groupe({ scenario: idScenario, scene: 1 })
          ).pipe(map((idGroupe) => idScenario))
        )
      );
  }

  /**
   * push a new Groupe in the database
   * link the groupe to the scenario
   * return the id of the new Groupe
   * @param groupe
   */
  createGroupe(groupe: Groupe): Observable<string> {
    let idScenario = groupe.scenario;
    groupe['@class'] = 'Groupe';
    delete groupe.id;
    delete groupe.scenario;
    return this.apiService
      .createDocument(groupe)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((idGroupe: string) => {
          return this.apiService
            .createRelationBetween(idGroupe, idScenario, 'seComposeDe ')
            .pipe(map((response) => response.result[0].in));
        })
      );
  }

  /**
   * update a  Scenario in the database
   * @param scenario
   */
  updateScenario(
    newScenario: Scenario,
    oldScenario: Scenario
  ): Observable<any> {
    let requests: Observable<any>[] = [];
    delete newScenario.tags;
    Object.keys(newScenario).forEach((key) => {
      if (newScenario[key] != oldScenario[key])
        requests.push(
          this.apiService.updateDocumentChamp(
            newScenario.id,
            key,
            newScenario[key].toString()
          )
        );
    });
    if (requests.length > 0) return forkJoin(requests);
    else return of(true);
    //  return of("34:2").pipe ( delay( 5000 ));
  }

  /**
   * update a list of group
   * @param scenario
   */
  updateGroupes(newGroupes: Groupe[], oldGroupes: Groupe[]): Observable<any> {
    let requests: Observable<any>[] = [];

    newGroupes.forEach((groupe: Groupe, index: number) => {
      let groupeJustCReate: boolean = oldGroupes[index] === undefined;
      if (groupeJustCReate || groupe.implique != oldGroupes[index].implique)
        requests.push(
          this.apiService.updateDocumentChamp(
            groupe.id,
            'implique',
            groupe.implique.toString()
          )
        );
      if (groupeJustCReate || groupe.psy != oldGroupes[index].psy)
        requests.push(
          this.apiService.updateDocumentChamp(
            groupe.id,
            'psy',
            groupe.psy.toString()
          )
        );
      if (groupeJustCReate || groupe.x != oldGroupes[index].x)
        requests.push(
          this.apiService.updateDocumentChamp(
            groupe.id,
            'x',
            groupe.x.toString()
          )
        );
      if (groupeJustCReate || groupe.y != oldGroupes[index].y)
        requests.push(
          this.apiService.updateDocumentChamp(
            groupe.id,
            'y',
            groupe.y.toString()
          )
        );
    });
    return forkJoin(requests);
    //  return of("34:2").pipe ( delay( 5000 ));
  }

  /**
   * renvoi les groupes liés à un scenario
   * @param id
   * @returns
   */
  getScenarioGroupes(id: string): Observable<Groupe[]> {
    return this.apiService
      .getRelationFrom(id, 'seComposeDe', 'Scenario')
      .pipe(
        map((response) => Groupe.instanciateListe<Groupe>(response.result))
      );
  }

  getGroupeScenario(id: string): Observable<Scenario> {
    return this.apiService
      .getRelationTo(id, 'seComposeDe', 'Groupe')
      .pipe(map((response) => new Scenario(response.result[0])));
  }

  getGroupeByLink(link, direction): Observable<Groupe | undefined> {
    return this.apiService
      .getDocument(link[direction].substring(1))
      .pipe(map((response) => new Groupe(response)));
  }

  getScenarioByLink(link, direction): Observable<Scenario | undefined> {
    return this.getScenarioById(link[direction].substring(1));
  }

  getGroupePlastrons(id: string): Observable<Plastron[]> {
    return this.apiService
      .getRelationFrom(id, 'seComposeDe', 'Groupe')
      .pipe(
        map((response) => Plastron.instanciateListe<Plastron>(response.result))
      );
  }

  deleteGroupe(groupe: Groupe): Observable<any> {
    console.log('delete groupe ', groupe);
    return this.apiService.deleteDocument(groupe.id);
  }
}
