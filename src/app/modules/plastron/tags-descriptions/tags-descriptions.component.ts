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
      console.log(value)
      this._modele = value;

      this.form = this.fb.group(value);
    }
  }

  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  tags = [
    'Lemon', 'Lime' , 'Apple'
  ];
  allTags =  ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  filteredTags: Observable<string[]>;
  tagCtrl = new FormControl();

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  @Output() newModele = new EventEmitter<Modele>();



  constructor(private fb: FormBuilder,public modelService:ModeleService,public dialog: MatDialog) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));
  }

  saveAsNewModel(){
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

  addTag(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.tags.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTag(index: number): void {

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }





}
