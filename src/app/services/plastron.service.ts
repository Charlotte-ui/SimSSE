import { Injectable } from '@angular/core';
import {
  Observable,
  concatMap,
  forkJoin,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Plastron } from '../models/vertex/plastron';
import { Modele } from '../models/vertex/modele';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../models/vertex/variablePhysio';
import { Scenario } from '../models/vertex/scenario';
import { Groupe } from '../models/vertex/groupe';
import { ApiService } from './api.service';
import { ModeleService } from './modele.service';
import { Profil } from '../models/vertex/profil';
import { ProfilService } from './profil.service';

@Injectable({
  providedIn: 'root',
})
export class PlastronService {
  constructor(
    public apiService: ApiService,
    public modeleService: ModeleService,
    public profilService: ProfilService
  ) {}

  /**
   * create a new model and change the plastron model to this one
   * @param plastron
   * @returns
   */
  changeModeleRef(plastron: Plastron): Observable<any> {
    let oldModelId = plastron.modele.id;
    return this.modeleService
      .duplicateModele(structuredClone(plastron.modele))
      .pipe(
        switchMap((newModeleId: string) =>
          this.assignNewModel(plastron, newModeleId).pipe(
            switchMap(() =>
              this.apiService.createRelationBetween(
                oldModelId,
                newModeleId,
                'aTemplate'
              )
            )
          )
        )
      );
  }

  updatePlastron(plastron: Plastron): Modele {
    return undefined;
  }

  getPlastronByLink(link): Observable<Plastron | undefined> {
    return this.getPlastronById(link['in'].substring(1));
    // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
  }

  getPlastronById(id): Observable<Plastron | undefined> {
    return this.apiService
      .getDocument(id)
      .pipe(map((response) => new Plastron(response)));
    // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
  }

  /**
   * renvoi le modele associé au plastron
   * @param idPlastron
   * @returns
   */
  getPlastronModele(idPlastron: string): Observable<Modele | undefined> {
    return this.apiService
      .getRelationFrom(idPlastron, 'aModele', 'Plastron')
      .pipe(map((response) => new Modele(response.result[0])));
    //return this.modeleService.getModeleByLink(link['in'].substring(1));
    // return this.firebaseService.getElementInCollectionByIds<Scenario>("Scenario",id);
  }

  /**
   * renvoi le profil associé au plastron
   * @param idPlastron
   * @returns
   */
  getPlastronProfil(idPlastron: string): Observable<Profil | undefined> {
    return this.apiService
      .getRelationFrom(idPlastron, 'aProfil', 'Plastron')
      .pipe(map((response) => new Profil(response.result[0])));
  }

  /**
   * renvoi le groupe associé au plastron
   * @param idPlastron
   * @returns
   */
  getPlastronGroupe(idPlastron: string): Observable<Groupe | undefined> {
    return this.apiService
      .getRelationTo(idPlastron, 'seComposeDe', 'Plastron')
      .pipe(map((response) => new Groupe(response.result[0])));
  }

  /***
   * assigne a new modele to the plastron
   */
  assignNewModel(plastron: Plastron, modeleId: string): Observable<any> {
    return this.apiService
      .createRelationBetween(modeleId, plastron.id, 'aModele')
      .pipe(
        switchMap(() =>
          this.apiService.deleteRelationBetween(plastron.modele.id, plastron.id)
        )
      );
  }

  /**
   * push a new Plastron in the database
   * return the id of the new Plastron
   * @param plastron
   */
  createPlastron(
    plastron: Plastron,
    idGroupe: string,
    idModele: string
  ): Observable<any> {
    let requests: Observable<any>[] = [];

    let randomAge = Math.floor(Math.random() * 50 + 20);

    plastron['@class'] = 'Plastron';
    delete plastron.id;
    delete plastron.profil;
    delete plastron.modele;
    delete plastron.groupe;

    requests.push(
      this.apiService
        .createDocument(plastron)
        .pipe(map((response) => this.apiService.documentId(response)))
    );

    requests.push(
      this.profilService.createProfil(new Profil({ age: randomAge }))
    );

    return forkJoin(requests).pipe(
      switchMap((response: [string, Profil]) => {
        console.log('createPlastron');
        let profil = response[1];
        let idPlastron = response[0];
        let idProfil = profil.id;

        return this.apiService
          .createRelationBetween(idProfil, idPlastron, 'aProfil')
          .pipe(map((response) => response.result[0].out))
          .pipe(
            switchMap(() => {
              return this.apiService
                .createRelationBetween(idPlastron, idGroupe, 'seComposeDe')
                .pipe(
                  switchMap(() => {
                    return this.apiService
                      .createRelationBetween(idModele, idPlastron, 'aModele')
                      .pipe(map(() => [idPlastron, profil]));
                  })
                );
            })
          );
      })
    );
    //  ;
  }

  deletePlastron(plastron: Plastron): Observable<any> {
    let requests: Observable<any>[] = [];

    requests.push(this.profilService.deleteProfil(plastron.profil));

    if (!plastron.modele.template)
      requests.push(this.modeleService.deleteModele(plastron.modele));

    requests.push(this.apiService.deleteDocument(plastron.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }
}
