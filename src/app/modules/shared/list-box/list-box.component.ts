import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Listable } from '../../core/models/interfaces/listable';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogComponent } from '../dialog/dialog.component';
import { ApiService } from '../../core/services/api.service';
import { Scenario } from '../../core/models/vertex/scenario';
import { Vertex } from '../../core/models/vertex/vertex';
import { TagService } from '../../core/services/tag.service';
import { concat, filter, finalize, switchMap, zipAll } from 'rxjs';
import { Tag } from '../../core/models/vertex/tag';
import { Triage } from '../../core/models/vertex/modele';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less'],
})
export class ListBoxComponent<T extends Listable> {
  keys;
  elements!: T[];
  triages: Triage[] = [Triage.EU, Triage.UA, Triage.UR];
  filtreActif: boolean = false;

  filterTag!: string[];
  filterTriage!: string[];

  filterTagElement!: string[];
  filterTriageElement!: string[];

  @Input() chips!: Tag[];
  @Input() title!: string;
  @Input() subTitle!: string;

  _classe: typeof Vertex;
  get classe(): typeof Vertex {
    return this._classe;
  }
  @Input() set classe(value: typeof Vertex) {
    if (value) {
      this._classe = value;

      this.apiService
        .getClasseElements<T>(value)
        .pipe(
          switchMap((elements: T[]) => {
            const requests = elements.map((element: T) =>
              this.tagService.getTags(element.id, value.className)
            );

            this.intElements(elements);

            return concat(requests).pipe(
              zipAll(),
              finalize(() => {})
            );
          })
        )
        .subscribe((TagsArray: Tag[][]) => {
          this.elements.map((element: T, index: number) => {
            element.tags = TagsArray[index];
          });
        });
    }
  }

  @Output() newElement = new EventEmitter<T>();

  constructor(
    public apiService: ApiService,
    public dialog: MatDialog,
    public tagService: TagService
  ) {
    this.elements = [];
    this.filterTagElement = [];
    this.filterTriageElement = [];
  }

  intElements(elements: T[]) {
    this.elements = elements;
    this.filterTagElement = [...elements.map((element) => element.title)];
    this.filterTriageElement = [...elements.map((element) => element.title)];

    this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
    const index = this.keys.indexOf('template', 0);
    if (index > -1) this.keys.splice(index, 1);
  }

  addElement() {
    let newElement = new this.classe()
 
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newElement,this.classe,this.triages, false,['template']],
    });

    dialogRef.afterClosed().subscribe((result: T) => {
      if (result) {
        this.newElement.emit(result);
        this.elements.push(result); 

        console.log(this.elements);
      }
    });
  }

  drop(event: CdkDragDrop<T[]>) {
    console.log('origin');

    console.log(event);

    moveItemInArray(this.elements, event.previousIndex, event.previousIndex);
  }

  changeFilterTag(event) {
    this.filterTag = event.value;
    this.filterTagElement = [];
    this.elements.forEach((element) => {
      if (
        element.tags.filter((tag: Tag) => this.filterTag.includes(tag.value)).length > 0
      ) {
        this.filterTagElement.push(element.title);
      }
    });

    this.changeFilter();
  }

  changeFilterTriage(event) {
    this.filterTriage = event.value;
    this.filterTriageElement = [];
    this.elements.forEach((element) => {
      if (this.filterTriage.indexOf(element['triage']) >= 0)
        this.filterTriageElement.push(element.title);
    });

    this.changeFilter();
  }

  changeFilter() {
    this.elements.forEach((element) => {
      if (
        this.filterTagElement.indexOf(element.title) >= 0 &&
        this.filterTriageElement.indexOf(element.title) >= 0
      )
        element['show'] = true;
      else element['show'] = false;
    });

    this.filtreActif = true;
  }

  deleteFilter() {
    this.filterTriageElement = [];
    this.filterTagElement = [];
    this.elements.map((element) => {
      element['show'] = true;
      this.filterTagElement.push(element.title);
      this.filterTriageElement.push(element.title);
    });
    this.filtreActif = false;
  }
}
