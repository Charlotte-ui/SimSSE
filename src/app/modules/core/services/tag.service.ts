import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, flatMap, forkJoin, map, of, tap } from 'rxjs';
import { Tag } from '../models/vertex/tag';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor( public apiService:ApiService) { }

  getAllTags(type): Observable<Tag[]>{
    return this.apiService.getClasseElementsWhithMatchingChamp<Tag>(Tag,"type",type)
  }

  getTags(idObject:string,classe:string): Observable<Tag[]> {
    return this.apiService.getRelationFrom(idObject,"estTague",classe)
    .pipe(map(response => (Tag.instanciateListe<Tag>(response.result))))
  }

  createTag(tag:Tag): Observable<string>{
    console.log("create tag");
        return of("true")

  }

  updateTags(tags:Tag[],sourceId:string): Observable<any>{
    const requests:Observable<string>[] = tags.map((tag: Tag) => {
          if (!tag.id) {
            return this.createTag(tag);
          } else return of(tag.id);
        });


      forkJoin(requests)

    
    return of(true)

  }
}
