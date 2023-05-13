import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { Vertex } from '../../../models/vertex/vertex';
import { Action, BioEvent } from 'src/app/models/vertex/node';
import { Button } from 'src/app/models/buttons';

@Component({
  selector: 'app-tab-regles',
  templateUrl: './tab-regles.component.html',
  styleUrls: ['./tab-regles.component.less'],
})

/* interface Moyenne {
  0:boolean;
  age:number;
}
 */
export class TabReglesComponent<T> {
  _elements!: T[];
  keys;
  displayedColumns;
  dataSource!: T[];

  button = new Button();


  @Input() classe: typeof Vertex|typeof Action|typeof BioEvent ;

  get elements(): T[] {
    return this._elements;
  }
  @Input() set elements(value: T[]) {
    if (value?.length>0) {
      this._elements = value;
      this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
      this.displayedColumns = [...this.keys];

      const index = this.displayedColumns.indexOf('id', 0);
      if (index > -1) this.displayedColumns.splice(index, 1);
      this.displayedColumns.push('edit');
      this.displayedColumns.push('delete');
      this.dataSource = this.elements;
    }
  }

  @Input() title: string;
  @Input() description: string;
  @Output() newElement = new EventEmitter<T>();

  constructor(public dialog: MatDialog) {}

  addElement() {
    let newElement = {} as T;
    this.keys.forEach((proprety) => {
      newElement[proprety] = '';
    });

    this.openDialog(newElement, -1,false);
  }

  editElement(element: T) {
    let id = this.elements.indexOf(element);
    this.openDialog(element, id,true);
  }

  openDialog(element: T, id: number,edit:boolean) {
    console.log('openDialog');

    console.log(element);
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [element, this.classe,[], edit],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result == undefined) return;

      if (Number(id) >= 0) this.dataSource[Number(id)] = result;
      else this.dataSource.push(result);

      console.log(this.dataSource);

      this.dataSource = [...this.dataSource]; // TODO : delete when bdd ok
      this.newElement.emit(result);
    });
  }

  removeElement(id: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: this.elements[id]['name'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result) this.dataSource.splice(id, 1);

      this.dataSource = [...this.dataSource];
    });
  }

  isColor(column: string) {
    //S console.log("isColor "+column)
    if (column == 'color') return true;
    return false;
  }

  getColor() {
    return this.button.getButtonByType(
      this.classe.getType({})).color;
  }

  getIcon() {
    return this.button.getButtonByType(this.classe.getType({}))?.icon;
  }
}
