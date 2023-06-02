import { Injectable } from '@angular/core';
import {
  Observable,
  concat,
  concatMap,
  delay,
  from,
  map,
  of,
  switchMap,
  zipAll,
} from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele, ModeleSaverArrays } from '../models/vertex/modele';
import {
  Trend,
  Event,
  Link,
  NodeType,
  EventType,
  Graph,
  Node,
} from '../models/vertex/node';
import { ApiService } from './api.service';
import { VariablePhysioInstance } from '../models/vertex/variablePhysio';
import { NodeService } from './node.service';
import { Trigger } from '../models/trigger';
import { getNodeByID } from '../functions/tools';
import { TagService } from './tag.service';

@Injectable({
  providedIn: 'root',
})
export class ModeleService {
  constructor(
    public apiService: ApiService,
    public nodeService: NodeService,
    public tagService: TagService
  ) {}

  createElement = this.createModele;
  deleteElement = this.deleteModele;

  /**
   * READ
   */

  /**
   * get the modele by their id
   * @param id
   * @returns
   */
  getModeleById(id: string): Observable<Modele | undefined> {
    return this.apiService
      .getDocument(id)
      .pipe(map((response) => new Modele(response)));
    //return this.firebaseService.getElementInCollectionByIds<Modele>("Modele",id);
  }

  getModeleByLink(link): Observable<Modele | undefined> {
    return this.getModeleById(link['in'].substring(1));
  }

  getGraph(id: string): Observable<Graph | undefined> {
    return this.apiService
      .getRelationFrom(id, 'rootGraph', 'Modele')
      .pipe(map((response) => new Graph(response.result[0])));
  }

  getGraphNodes(id: string): Observable<Node[] | undefined> {
    return this.apiService
      .getRelationFrom(id, 'aNode', 'Graph')
      .pipe(map((response) => Node.instanciateListe<Node>(response.result)));
  }

  getTrigger(id: string): Observable<Trigger[]> {
    return this.apiService
      .getLinkAndRelationFrom(id, 'triggeredAt', 'Modele')
      .pipe(
        map((response) => {
          let res = response.result[0];
          return res.$a.map(
            (event: Event, index: number) =>
              new Trigger({
                '@rid': res.$b[index]['@rid'],
                time: res.$b[index].time,
                in: event.event,
              })
          );
        })
      );
  }

  getGraphLinks(arrayId: string[]): Observable<Link[] | undefined> {
    return this.apiService
      .getLinkFromMultiple(arrayId, 'link')
      .pipe(map((response) => Link.instanciateListe<Link>(response.result)));
  }

  /**
   * CREATE
   */

  /**
   * push a new Modele in the database
   * return the id of the new Modele,  the id of the graph and the id
   * @param modele
   */
  createModele(
    modele: Modele,
    template?: boolean | string
  ): Observable<string[]> {
    modele['@class'] = 'Modele';
    if (template) modele['template'] = template;
    delete modele.id;
    delete modele.tags;
    delete modele.graph;
    delete modele.triggeredEvents;
    return this.apiService
      .createDocument(modele)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((idModele: string) =>
          this.nodeService
            .createGraph(new Graph({ template: true, name: 'root' }))
            .pipe(
              switchMap((indexes: string[]) => {
                let idGraph = indexes[0].substring(1);
                let idStart = indexes[1].substring(1);

                return this.apiService
                  .createRelationBetween(idGraph, idModele, 'rootGraph')
                  .pipe(
                    switchMap(() =>
                      this.apiService
                        .createRelationBetweenWithProperty(
                          idStart,
                          idModele,
                          'triggeredAt',
                          'time',
                          '0'
                        )
                        .pipe(switchMap(() => of([idModele, idGraph, idStart])))
                    )
                  );
              })
            )
        )
      );
  }

  /**
   * create a deep copy of a model
   * @param modele
   */
  duplicateModele(modele: Modele): Observable<string> {
    let graphToCopy = structuredClone(modele.graph);

    return this.createModele(modele, modele.id).pipe(
      switchMap((indexes: string[]) => {
        let idnewModele = indexes[0];
        let idnewGraph = indexes[1];
        let idnewStart = indexes[2];
        return this.nodeService
          .duplicateGraph(graphToCopy, idnewGraph, idnewStart)
          .pipe(switchMap(()=> of(idnewModele)))
      })
    );
  }

  /**
   * UPDATE
   */

  /**
   * update a  Modele in the database
   * @param modele
   */
  updateModele(modele: Modele, champToUpdate: string[]): Observable<any> {
    champToUpdate = champToUpdate.filter(
      (value, index) => champToUpdate.indexOf(value) === index
    ); // remove duplicates
    const requests = champToUpdate.map((champ: string) =>
      this.apiService.updateDocumentChamp(modele.id, champ, modele[champ])
    );
    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }

  updateTriggers(
    modele: Modele,
    triggerToUpdate: Trigger[],
    triggerToDelete: Trigger[]
  ): Observable<any> {
    let triggerToCreate = triggerToUpdate.filter(
      (trigger: Trigger) =>
        !triggerToDelete.includes(trigger) && trigger.id == ''
    );

    // on n'update pas les triggers à détruire
    triggerToUpdate = triggerToUpdate.filter(
      (trigger: Trigger) =>
        !triggerToDelete.includes(trigger) && trigger.id != ''
    );

    const createRequests = triggerToCreate.map((trigger: Trigger) => {
      let event = getNodeByID(modele.graph, trigger.in);
      if (event)
        return this.apiService.createRelationBetweenWithProperty(
          event.id,
          modele.id,
          'triggeredAt',
          'time',
          trigger.time.toString()
        );
      else return of();
    });

    const updateRequests = triggerToUpdate.map((trigger: Trigger) =>
      this.apiService.updateDocumentChamp(
        trigger.id,
        'time',
        trigger.time.toString()
      )
    );

    const deleteRequests = triggerToDelete.map((trigger: Trigger) =>
      this.apiService.deleteEdge(trigger.id)
    );

    return concat(createRequests, updateRequests, deleteRequests).pipe(
      zipAll()
    );
  }

  /**
   * the plastron modele is now
   * @param plastron
   * @returns
   */
  createNewModeleTemplate(modele: Modele, newModele: Modele): Observable<any> {

    let saver = modele.initSaver();

    modele.title = newModele.title;
    saver.champToUpdate.push('title');

    if (modele.description != newModele.description) {
      modele.description = newModele.description;
      saver.champToUpdate.push('description');
    }

    if (modele.triage != newModele.triage) {
      modele.triage = newModele.triage;
      saver.champToUpdate.push('triage');
    }

    modele.template = true;
    saver.champToUpdate.push('template');

    let requests = modele.save(saver, this.tagService, this, this.nodeService);

    return concat(requests)
      .pipe(zipAll())
      .pipe(
        switchMap(() =>
          this.apiService.deleteOutRelation(modele.id, 'aTemplate')
        )
      );
  }

  /**
   * DELETE
   */

  /**
   * delete a modele from bdd
   * @param modele
   */
  deleteModele(modele: Modele): Observable<any> {
    let requests: Observable<any>[] = [];

    requests.push(
      this.apiService
        .getRelationFrom(modele.id, 'rootGraph', 'Modele')
        .pipe(map((response) => new Graph(response.result[0])))
        .pipe(switchMap((graph: Graph) => this.nodeService.deleteGraph(graph)))
    );

    requests.push(this.apiService.deleteDocument(modele.id));

    return from(requests).pipe(
      concatMap((request: Observable<any>) => request)
    );
  }
}
