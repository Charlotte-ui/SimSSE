import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Listable } from '../../core/models/interfaces/listable';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogComponent } from '../dialog/dialog.component';
import { ApiService } from '../../core/services/api.service';
import { Scenario } from '../../core/models/scenario';
import { Vertex } from '../../core/models/vertex';
import { TagService } from '../../core/services/tag.service';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less'],
})
export class ListBoxComponent<T extends Listable> {
  keys;
  elements!: T[];

  @Input() chips!: string[];

  @Input() title!: string;
  @Input() subTitle!: string;

  _classe: typeof Vertex;
  get classe(): typeof Vertex {
    return this._classe;
  }
  @Input() set classe(value: typeof Vertex) {
    if (value) {
      this._classe = value;
      this.apiService.getClasseElements<T>(value).subscribe((elements) => {
        this.elements = elements;
        this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
        const index = this.keys.indexOf('gabarit', 0);
        if (index > -1) this.keys.splice(index, 1);
        this.elements.forEach((element) => {
          element.tags = [];

          this.tagService.getTags(element.id,value.className).subscribe((response) => {
            response.forEach(tag => { // TODO ; utiliser la classe TAG au lieu des string pour les tabeaux de tags
              element.tags.push(tag.value)
            });   
          })


  
        });
      });
    }
  }

  @Output() newElement = new EventEmitter<T>();

  constructor(
    private router: Router,
    public apiService: ApiService,
    public dialog: MatDialog,
    public tagService: TagService
  ) {
    this.elements = [];
  }

  addElement() {
    let newElement = {} as T;
    this.keys.forEach((proprety) => {
      newElement[proprety] = '';
    });

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newElement, [], false],
    });

    dialogRef.afterClosed().subscribe((result: T) => {
      if (result) {
        this.newElement.emit(result);
        this.elements.push(result); // add to database with gabarit = true

        console.log(this.elements);
      }
    });
  }

  drop(event: CdkDragDrop<T[]>) {
    console.log('origin');

    console.log(event);

    moveItemInArray(this.elements, event.previousIndex, event.previousIndex);
  }

  changeFilter(event) {
    let filter = event.value;

    this.elements.forEach((element) => {
      if (element.tags.filter((value) => filter.includes(value)).length > 0) {
        element['show'] = true;
      } else element['show'] = false;
    });
  }
}
