import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  Observable,
  concat,
  flatMap,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  zipAll,
} from 'rxjs';
import { Tag } from '../models/vertex/tag';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  constructor(public apiService: ApiService) {}

  getAllTags(type): Observable<Tag[]> {
    return this.apiService.getClasseElementsWhithMatchingChamp<Tag>(
      Tag,
      'type',
      type
    );
  }

  getTags(idObject: string, classe: string): Observable<Tag[]> {
    return this.apiService
      .getRelationFrom(idObject, 'estTague', classe)
      .pipe(map((response) => Tag.instanciateListe<Tag>(response.result)));
  }

  createTag(tag: Tag, type: string): Observable<string> {
    tag["@class"] = "Tag";
    tag["type"] = type;
    delete tag.id;
    console.log('create tag');
    console.log(tag);
    return this.apiService.createDocument(tag);
  }

  /**
   * ajoute une liste de tag à une source
   * @param tags
   * @param sourceId
   * @param type
   * @returns liste des id des liens créés
   */
  addTagsToSource(
    tags: Tag[],
    sourceId: string,
    type: string
  ): Observable<string[]> {
    // create the tag if it doesn't exist
    const requests: Observable<string>[] = tags.map((tag: Tag) => {
      if (!tag.id) {
        return this.createTag(tag, type);
      } else return of(tag.id);
    });

    return forkJoin(requests).pipe(
      switchMap((indexes: string[]) => {
        const requests = indexes.map((index: string) =>
          this.apiService.createRelationBetween2(index, sourceId, 'estTague')
        );

        return concat(requests).pipe(zipAll());
      })
    );
  }

  /**
   * supprime une liste de tag à une source
   * @param tags
   * @param sourceId
   * @param type
   * @returns liste des id des liens supprimés
   */
  deleteTagsFromSource(
    tags: Tag[],
    sourceId: string,
  ): Observable<string[]> {
    const requests = tags.map((tag: Tag) =>
      this.apiService.deleteRelationBetween(tag.id, sourceId, 'estTague')
    );

    return concat(requests).pipe(zipAll());
  }
}
