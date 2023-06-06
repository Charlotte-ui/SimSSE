import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Profil } from '../models/vertex/profil';
import { ApiService } from './api.service';
import { concat, concatMap, from, map, of, switchMap, zipAll } from 'rxjs';
import {
  VariablePhysioInstance,
  VariablePhysioTemplate,
} from '../models/vertex/variablePhysio';

@Injectable({
  providedIn: 'root',
})
export class ProfilService {
  constructor(
    public apiService: ApiService
  ) {}
  getProfilById(id: string): Observable<Profil | undefined> {
    return this.apiService
      .getDocument(id)
      .pipe(map((response) => new Profil(response)));
    //  return this.firebaseService.getElementInCollectionByIds("Profil",id);
  }

  updateProfil(profil: Profil) {
    // TODO update bdd
  }

  updateVariables(
    profil: Profil,
    oldVariables: VariablePhysioInstance[],
    idToSave: string[]
  ): Observable<any>[] {
    let requests: Observable<any>[] = [];

    profil.targetVariable.forEach(
      (variable: VariablePhysioInstance, index: number) => {
        if (idToSave.includes(variable.id)) {
          let keys = Object.keys(variable) as Array<
            keyof VariablePhysioInstance
          >;
          keys.forEach((key) => {
            if (variable[key] != oldVariables[index][key])
              requests.push(
                this.apiService.updateDocumentChamp(
                  variable.id,
                  key,
                  variable[key].toString()
                )
              );
          });
        }
      }
    );

  
    return requests.length>0?requests:[of()];
  }

  getVariable(
    idProfil,
    idVariableTemplate
  ): Observable<VariablePhysioInstance | undefined> {
    return this.apiService
      .getVariable(idProfil, idVariableTemplate)
      .pipe(
        map(
          (response) =>
            new VariablePhysioInstance(
              response.result[0]['intersect($a, $b)'][0]
            )
        )
      );
  }

  /**
   * push a new Profil in the database
   * return the id of the new Profil
   * @param profil
   */
  createProfil(profil: Profil): Observable<Profil> {
    profil['@class'] = 'Profil';
    delete profil.id;
    delete profil.targetVariable;
    return this.apiService
      .createDocument(profil)
      .pipe(map((response) => new Profil(response)));
  }

  createVariableCible(
    varTemp: VariablePhysioTemplate,
    profil: Profil
  ): Observable<any> {
    let variable = new VariablePhysioInstance(varTemp);
    variable.cible = varTemp.defaultValue; // TODO ; replace by age moyen
    variable.template = varTemp.id; // TODO ; replace by age moyen

    let variableToSave = structuredClone(variable);
    variableToSave['@class'] = 'VariablePhysio';
    delete variableToSave.id;
    return this.apiService
      .createDocument(variableToSave)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((idVariable: string) =>
          this.apiService
            .createRelationBetween(varTemp.id, idVariable, 'aTemplate')
            .pipe(
              switchMap(() => {
                this.apiService
                  .createRelationBetween(
                    idVariable,
                    profil.id,
                    'aVariableCible'
                  )
                  .subscribe();
                variable.id = idVariable;

                return of(variable);
              })
            )
        )
      );
  }

  deleteProfil(profil: Profil): Observable<any> {
    let requests: Observable<any>[] = [];

    requests.push(
      this.apiService
        .getRelationFrom(profil.id, 'aVariableCible', 'Profil')
        .pipe(
          map((response) =>
            VariablePhysioInstance.instanciateListe<VariablePhysioInstance>(
              response.result
            )
          )
        )
        .pipe(
          switchMap((variables: VariablePhysioInstance[]) =>
            concat(
              variables.map((variable: VariablePhysioInstance) =>
                this.apiService.deleteDocument(variable.id)
              )
            ).pipe(zipAll())
          )
        )
    );

    requests.push(this.apiService.deleteDocument(profil.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }
}
