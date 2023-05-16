import { Injectable } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Modele } from '../models/vertex/modele';
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

@Injectable({
  providedIn: 'root',
})
export class ModeleService {
  constructor(
    public firebaseService: FirebaseService,
    public apiService: ApiService,
    public nodeService: NodeService
  ) {}

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

  getTrigger(id: string): Observable<any | undefined> {
    return this.apiService
      .getLinkAndRelationFrom(id, 'triggeredAt', 'Modele')
      .pipe(map((response) => response.result[0]));
  }

  getGraphLinks(arrayId: string[]): Observable<Link[] | undefined> {
    return this.apiService
      .getLinkFromMultiple(arrayId, 'link')
      .pipe(map((response) => Link.instanciateListe<Link>(response.result)));
  }

  /**
   * push a new Modele in the database
   * return the id of the new Modele,  the id of the graph and the id 
   * @param modele
   */
  createModele(modele: Modele, template: boolean|string): Observable<string[]> {
    modele['@class'] = 'Modele';
    modele['template'] = template;
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
                    switchMap(() => {
                 
                      this.apiService
                        .createRelationBetweenWithProperty(
                          idStart,
                          idModele,
                          'triggeredAt',
                          'time',
                          '0'
                        )
                        .subscribe();
                      return of([idModele,idGraph,idStart]);
                    })
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
  duplicateModele(modele:Modele):Observable<string>{
    let graphToCopy = structuredClone(modele.graph);

    return this.createModele(modele,modele.id).pipe(switchMap((indexes:string[])=>{
      let idnewModele = indexes[0]
      let idnewGraph = indexes[1]
      let idnewStart = indexes[2]
      this.nodeService.duplicateGraph(graphToCopy,idnewGraph,idnewStart).subscribe()
      return of(idnewModele)
    }))

  }

  /**
   * update a  Modele in the database
   * @param modele
   */
  updateModele(modele: Modele): Observable<any> {
    return this.apiService.updateDocumentChamp(
      modele.id,
      'description',
      "'" + modele.description + "'"
    );
  }
}
