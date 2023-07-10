import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Modele } from '../../../models/vertex/modele';
import { ModeleService } from '../../../services/modele.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RegleService } from '../../../services/regle.service';
import { Tag } from '../../../models/vertex/tag';
import { TagService } from '../../../services/tag.service';
import { differenceMaps } from 'src/app/functions/tools';

@Component({
  selector: 'app-tags-descriptions',
  templateUrl: './tags-descriptions.component.html',
  styleUrls: ['./tags-descriptions.component.less'],
})
export class TagsDescriptionsComponent {
  titleToSave:boolean = false;
  descriptionToSave:boolean = false;
  examunToSave:boolean = false;

  form: FormGroup;
  _modele!: Modele;
  arrayTag:Tag[];
  get modele(): Modele {
    return this._modele;
  }
  @Input() set modele(value: Modele) {
    if (value) {
      this._modele = value;

      this.tagService.getTags(value.id, 'Modele').subscribe((tags: Tag[]) => {

        value.tags = new Map(tags.map((tag:Tag) => [tag.id, tag]));
        this.arrayTag = tags;
      });

      this.form = this.fb.group(value);

      this.form.valueChanges.subscribe((newModele: Modele) => {


        Modele.updatables.forEach(champ => {
          if (this.modele[champ] != newModele[champ]) {
          this.modele[champ] = newModele[champ];
          this[champ+'ToSave'] = true;          
        }
        });
        
       
      });

      
    }
  }


  @Input() allTags!: Tag[];
  @Input() chooseTitle!: boolean;

  @Output() newTags = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    public modelService: ModeleService,
    public dialog: MatDialog,
    public regleService: RegleService,
    private tagService: TagService
  ) {}

  wrapArray(object) {
    let clone = [];
    Object.keys(object).forEach((key) => {
      if (Array.isArray(object[key]))
        clone[key] = [structuredClone(object[key])];
      else clone[key] = structuredClone(object[key]);
    });

    return clone;
  }

  unwrapArray(object) {
    Object.keys(object).forEach((key) => {
      if (Array.isArray(object[key])) object[key] = object[key][0];
    });

    return object;
  }

  updateTags(tags: Tag[]) {
    let newTags = new Map(tags.map((tag:Tag) => [tag.id, tag]));

    let tagsToCreate = differenceMaps(newTags,this.modele.tags)
    let tagsToDelete = differenceMaps(this.modele.tags,newTags)

    this.tagService.updateTags(this.modele,'modele',Array.from(tagsToCreate.values()),Array.from(tagsToDelete.values())).subscribe(()=>{
      newTags.forEach((tag:Tag) => {
        this.modele.tags.set(tag.id,tag) 
      });

      tagsToDelete.forEach((tag:Tag) => {
        this.modele.tags.delete(tag.id) 
      });
    })

  }

  updateTriage(event) {
    this.modele.triage = event.value;
    this.modelService.updateModele(this.modele,['triage']).subscribe()
  }

  saveTitle(){
    this.modelService.updateModele(this.modele,['title']).subscribe(()=>this.titleToSave = false)
  }

  saveDescription(){
    this.modelService.updateModele(this.modele,['description']).subscribe(()=>this.descriptionToSave = false)
  }

  saveExamun(){
    this.modelService.updateModele(this.modele,['examun']).subscribe(()=>this.examunToSave = false)
  }
}
