import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Modele } from '../../core/models/vertex/modele';
import { ModeleService } from '../../core/services/modele.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RegleService } from '../../core/services/regle.service';
import { Tag } from '../../core/models/vertex/tag';
import { TagService } from '../../core/services/tag.service';

@Component({
  selector: 'app-tags-descriptions',
  templateUrl: './tags-descriptions.component.html',
  styleUrls: ['./tags-descriptions.component.less']
})
export class TagsDescriptionsComponent {
  oldTags!: Tag[]; // array of tags before changes, use to define wich tag create add wich delete after changes

  form: FormGroup;
  _modele!: Modele;
  get modele():  Modele {
    return this._modele;
  }
  @Input() set modele(value:Modele ) {
    if(value){
      this._modele = value;

      this.tagService.getTags(value.id,'Modele').subscribe((tags:Tag[])=>{
        value.tags = tags ;
        this.oldTags = [...tags]

      })



      this.form = this.fb.group(this.wrapArray(value));

      this.form.valueChanges.subscribe(value=>{
        this.newModele.emit(this.form.value)
      })
    }
  }

  @Output() newModele = new EventEmitter<Modele>();

  @Input() allTags!:Tag[];

  @Output() newTags = new EventEmitter<any>();


  constructor(private fb: FormBuilder,public modelService:ModeleService,public dialog: MatDialog,public regleService:RegleService,private tagService:TagService) {
   
  }


  wrapArray(object){
    let clone = []
    Object.keys(object).forEach(key => {

      if (Array.isArray(object[key])) clone[key] = [structuredClone(object[key])];
      else clone[key] = structuredClone(object[key]);
      
    });

    return clone

  }


  unwrapArray(object){
    Object.keys(object).forEach(key => {

      if (Array.isArray(object[key])) object[key] = object[key][0];
      
    });

    return object

  }

  updateTags(tags: Tag[]) {
    let newTags = this.modele.tags.filter(
      (tag: Tag) => this.oldTags.indexOf(tag) < 0
    );

    let tagsToDelete = this.oldTags.filter(
      (tag: Tag) => !tag.id || this.modele.tags.indexOf(tag) < 0
    );

    this.modele.tags = tags;
    this.newTags.emit({newTags:newTags,tagsToDelete:tagsToDelete})
  }

}
