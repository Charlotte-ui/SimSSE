import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Listable } from '../../core/models/listable';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less'],
})
export class ListBoxComponent<T extends Listable> {
  _type: string;
  keys;
  elements!: T[];

  @Input() title!: string;
  @Input() subTitle!: string;
  @Input() set type(value: string) {
    if (value) {
      this._type = value;
      this.firebaseService.getCollectionById<T>(value).subscribe((elements) => {
        this.elements = elements;
        this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
        const index = this.keys.indexOf('gabarit', 0);
        if (index > -1) this.keys.splice(index, 1);
      });
    }
  }

@Output() newElement = new EventEmitter<T>();


  constructor(
    private router: Router,
    public firebaseService: FirebaseService,
    public dialog: MatDialog
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

    dialogRef.afterClosed().subscribe((result:T) => {
      

      if (result ){
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
}
