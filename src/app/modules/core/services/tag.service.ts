import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, flatMap, map, of, tap } from 'rxjs';
import { Tag } from '../models/tag';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor( public apiService:ApiService) { }


  getTags(idObject:string): Observable<any[]> {
    return this.apiService.getRelationFrom(idObject,"estTague");
  }

  getTagName(link): Observable<any>{
    return this.apiService.getDocument(link['in'].substring(1))
  }

  getAllTags(type): Observable<any>{
    return this.apiService.getClasseElementsWhithMatchingChamp<Tag>(Tag,"type",type)
    .pipe(map((tags: Tag[]) => tags.map(tag => tag.value)))
  }
}
