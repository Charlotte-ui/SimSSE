import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Modele } from '../../core/models/modele';
import { ModeleService } from '../../core/services/modele.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddRegleDialogComponent } from '../../regles/tab-regles/add-regle-dialog/add-regle-dialog.component';

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
      console.log("set model tag et description")
      console.log(value)
      this._modele = value;
      this.form = this.fb.group(this.wrapArray(value));
    }
  }

  @Output() newModele = new EventEmitter<Modele>();

  allTags =  ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  constructor(private fb: FormBuilder,public modelService:ModeleService,public dialog: MatDialog) {}

  saveAsNewModel(){
    console.log("saveAsNewModel")

    console.log(this.modele)
    let newModel = structuredClone(this.modele);
    newModel.titre="";
    delete newModel.id;
    delete newModel.gabarit;

    const dialogRef = this.dialog.open(AddRegleDialogComponent,
      {data: newModel});

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result == undefined) return;

      this.modelService.createNewModel(result,true);
      this.newModele.emit(result);

    });

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

  updateTags(tags: string[]) {
    this.modele.tags = tags;

    }

}
