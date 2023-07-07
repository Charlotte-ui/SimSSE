import { Injectable } from '@angular/core';
import {
  Observable,
  concat,
  concatMap,
  delay,
  forkJoin,
  from,
  map,
  of,
  switchMap,
  zipAll,
} from 'rxjs';

import { Scenario } from '../models/vertex/scenario';
import { Groupe } from '../models/vertex/groupe';
import { Plastron } from '../models/vertex/plastron';
import { ApiService } from './api.service';
import { TagService } from './tag.service';
import { Tag } from '../models/vertex/tag';
import { PlastronService } from './plastron.service';

@Injectable({
  providedIn: 'root',
})
export class ScenarioService {
  constructor(
    public apiService: ApiService,
    public tagService: TagService,
    public plastronService: PlastronService
  ) {}

  createElement = this.createScenario;
  deleteElement = this.deleteScenario;

  /**
   * GETTERS
   */

  /**
   * return all the scenarios
   * @returns
   */
  getScenarios(): Observable<Scenario[]> {
    return this.apiService.getClasseElements<Scenario>(Scenario);
  }

  getScenarioById(id: string): Observable<Scenario | undefined> {
    return this.apiService
      .getDocument(id)
      .pipe(map((response) => new Scenario(response)));
  }


  /**
   * get all groupes
   * @returns
   */
  getGroupes(): Observable<Groupe[]> {
    return this.apiService.getClasseElements<Groupe>(Groupe);
  }

  /**
   * CREATERS
   */

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
   * UPDATERS
   */

    /**
   * update a  Scenario in the database
   * if champs are precised, updated only those champs
   * else, update all champs
   * @param scenario
   */
  updateScenario(scenario: Scenario, champs?: string[]): Observable<string[]> {
    delete scenario.tags;
    return this.apiService.updateVertex(scenario,champs)
  }

      /**
   * update a  Scenario in the database
   * if champs are precised, updated only those champs
   * else, update all champs
   * @param scenario
   */
  updateGroupe(groupe: Groupe, champs?: string[]): Observable<string[]> {
    return this.apiService.updateVertex(groupe,champs)
  }

  /**
   * update a list of group
   * @param scenario
   */
  updateGroupes(newGroupes: Groupe[], oldGroupes: Groupe[]): Observable<any> {
    let requests: Observable<any>[] = [];

    // TODO : enregistre les nouveau UR, UA, EU par groupe
    newGroupes.forEach((groupe: Groupe, index: number) => {
      // new groups
      let groupeJustCreate: boolean = oldGroupes[index] === undefined;
      let champsToUpdate = ['implique', 'psy', 'x', 'y', 'UA', 'UR', 'EU'];

      champsToUpdate.forEach((champ: string) => {
        if (groupeJustCreate || groupe[champ] != oldGroupes[index][champ])
          requests.push(
            this.apiService.updateDocumentChamp(
              groupe.id,
              champ,
              groupe[champ].toString()
            )
          );
      });
    });
    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );

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

  /**
   * DELETE
   */

  /**
   * delete a groupe and tilt all this plastrons to the default group
   * @param groupe
   * @param defaultGroupe
   * @returns
   */
  removeGroupe(groupe: Groupe, defaultGroupe: Groupe): Observable<any> {
    return this.apiService
      .getRelationFrom(groupe.id, 'seComposeDe', 'Groupe')
      .pipe(
        map((response) => Plastron.instanciateListe<Plastron>(response.result))
      )
      .pipe(
        switchMap((plastrons: Plastron[]) => {
          let requests = plastrons.map((plastron: Plastron) =>
            this.apiService.createRelationBetween(
              plastron.id,
              defaultGroupe.id,
              'seComposeDe'
            )
          );
          let deleteRequest = this.apiService.deleteDocument(groupe.id);
          requests.push(deleteRequest);
          return from(requests).pipe(
            concatMap((request: Observable<any>) => request)
          );
        })
      );
  }

  /**
   * delete a groupe and all this plastrons
   * @param groupe
   * @returns
   */
  deleteGroupe(groupe: Groupe): Observable<any> {
    return this.apiService
      .getRelationFrom(groupe.id, 'seComposeDe', 'Groupe')
      .pipe(
        map((response) => Plastron.instanciateListe<Plastron>(response.result))
      )
      .pipe(
        switchMap((plastrons: Plastron[]) => {
          let requests = plastrons.map((plastron: Plastron) =>
            this.plastronService.deletePlastron(plastron)
          );
          let deleteRequest = this.apiService.deleteDocument(groupe.id);
          requests.push(deleteRequest);
          return from(requests).pipe(
            concatMap((request: Observable<any>) => request)
          );
        })
      );
  }

  /**
   * delete a scenario from bdd
   * @param scenario
   */
  deleteScenario(scenario: Scenario): Observable<any> {
    let requests: Observable<any>[] = [];

    requests.push(
      this.apiService
        .getRelationFrom(scenario.id, 'seComposeDe', 'Scenario')
        .pipe(
          map((response) => Groupe.instanciateListe<Groupe>(response.result))
        )
        .pipe(
          switchMap((groupes: Groupe[]) => {
            const requests = groupes.map((groupe: Groupe) =>
              this.deleteGroupe(groupe)
            );

            return from(requests).pipe(
              concatMap((request: Observable<any>) => request)
            );
          })
        )
    );

    requests.push(this.apiService.deleteDocument(scenario.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }
}
