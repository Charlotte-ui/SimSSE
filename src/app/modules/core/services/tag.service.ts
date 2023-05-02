import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, flatMap, map, of, tap } from 'rxjs';
import { Tag } from '../models/tag';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor( public apiService:ApiService) { }

  getAllTags(type): Observable<any>{
    return this.apiService.getClasseElementsWhithMatchingChamp<Tag>(Tag,"type",type)
    .pipe(map((tags: Tag[]) => tags.map(tag => tag.value)))
  }

  
  getTags(idObject:string,classe:string): Observable<Tag[]> {
    return this.apiService.getRelationFrom(idObject,"estTague",classe)
    .pipe(map(response => (Tag.instanciateListe<Tag>(response.result))))
  }
}
