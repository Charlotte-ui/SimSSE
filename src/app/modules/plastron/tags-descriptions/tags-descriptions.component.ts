import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Modele } from '../../core/models/modele';
import { ModeleService } from '../../core/services/modele.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RegleService } from '../../core/services/regle.service';
import { Tag } from '../../core/models/tag';
import { TagService } from '../../core/services/tag.service';

@Component({
  selector: 'app-tags-descriptions',
  templateUrl: './tags-descriptions.component.html',
  styleUrls: ['./tags-descriptions.component.less']
})
export class TagsDescriptionsComponent {

  form: FormGroup;
  _modele!: Modele;
  get modele():  Modele {
    return this._modele;
  }
  @Input() set modele(value:Modele ) {
    if(value){
      this._modele = value;
      this.form = this.fb.group(this.wrapArray(value));
    }
  }

  @Output() newModele = new EventEmitter<Modele>();

  @Input() allTags!:Tag[];

  @Output() newChange = new EventEmitter<boolean>();


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
    this.modele.tags = tags;
    this.newChange.emit(true)

    }

}
