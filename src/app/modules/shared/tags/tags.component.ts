import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.less']
})
export class TagsComponent {
  separatorKeysCodes = [ENTER, COMMA];
  filteredTags: Observable<string[]>;
  tagCtrl = new FormControl();

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  @Input() allTags;
  @Input() tags;

  @Output() newTags = new EventEmitter<string[]>();

  constructor() {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));
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

     this.newTags.emit(this.tags);
  }

  removeTag(index: number): void {

    if (index >= 0) {
      this.tags.splice(index, 1);
    }

    
     this.newTags.emit(this.tags);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.newTags.emit(this.tags);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }


}
