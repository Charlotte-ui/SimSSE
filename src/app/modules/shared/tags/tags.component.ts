import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, map, startWith } from 'rxjs';
import { Tag } from '../../core/models/vertex/tag';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.less']
})
export class TagsComponent {
  separatorKeysCodes = [ENTER, COMMA];
  filteredTags: Observable<Tag[]>;
  tagCtrl = new FormControl();

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  @Input() allTags:Tag[];
  @Input() tags:Tag[];

  @Output() newTags = new EventEmitter<Tag[]>();

  constructor() {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: Tag) => tag ? this._filter(tag) : this.allTags.slice()));
  }

  addTag(event: MatChipInputEvent): void {

    let input = event.input;
    let value = event.value;


    if ((value || '').trim()) {
      this.tags.push(new Tag({value:value}));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

   this.newTags.emit(this.tags);
  }

  removeTag(index: number): void {
    console.log("removeTag")
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    this.newTags.emit(this.tags);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(new Tag({value:event.option.viewValue}));
    this.tagInput.nativeElement.value = '';
    this.newTags.emit(this.tags);
    console.log("tags")
    console.log(this.tags)
  }

  private _filter(tag: Tag): Tag[] {
    console.log("filter")
    const filterValue = tag.value;
    return this.allTags.filter((value:Tag) => value.value.indexOf(filterValue) === 0);
  }


}
