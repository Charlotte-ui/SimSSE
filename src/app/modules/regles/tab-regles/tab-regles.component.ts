import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { Vertex } from '../../../models/vertex/vertex';
import { Button, champLabel } from 'src/app/functions/display';
import { RegleService } from 'src/app/services/regle.service';
import { CategoryAction } from 'src/app/models/vertex/event';
import { deleteElementFromArray } from 'src/app/functions/tools';

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
export class TabReglesComponent<T extends Vertex> {
  _elements!: T[];
  keys;
  displayedColumns;

  champLabel = champLabel;

  button = new Button();

  getType = Button.getType ;


  @Input() classe: typeof Vertex;

  get elements(): T[] {
    return this._elements;
  }
  @Input() set elements(value: T[]) {
    if (value?.length > 0) {
      this._elements = value;
      this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
      this.displayedColumns = [...this.keys];
      deleteElementFromArray(this.displayedColumns,'id')
      this.displayedColumns.push('edit');
      this.displayedColumns.push('delete');
    }
  }

  @Input() title: string;
  @Input() description: string;

  constructor(public dialog: MatDialog, private regleService: RegleService) {}

  addElement() {
    let newElement = {} as T;
    this.keys.forEach((proprety) => {
      newElement[proprety] = '';
    });

    this.openDialog(newElement, -1, false);
  }

  editElement(element: T) {
    let id = this.elements.indexOf(element);
    this.openDialog(element, id, true);
  }

  openDialog(element: T, id: number, edit: boolean) {

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [element, this.classe, Object.values(CategoryAction), edit],
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result == undefined) return;

      if (Number(id) >= 0) {
        // UPDATE
        this.regleService.updateRegle(result).subscribe();
        this.elements[Number(id)] = result;
      } else {
        // ADD
        this.regleService
          .createRegle(result, this.classe.name)
          .subscribe((id: string) => {
            result.id = id;
            delete result['@class'];
            this.elements.push(result);

            this.elements = [...this.elements];
          });
      }

      this.elements = [...this.elements]; // TODO : delete when bdd ok
    });
  }

  removeElement(id: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: [
        'Supprimer ' + this.elements[id]['name'],
        'Voulez-vous vraiment suprimer ' + this.elements[id]['name'],
      ],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.regleService.deleteRegle(this.elements[id].id).subscribe(() => {
          this.elements.splice(id, 1);
          this.elements = [...this.elements];
        });
      }
    });
  }

  isColor(column: string) {
    if (column == 'color') return true;
    return false;
  }

  getColor() {
    return this.button.getButtonByType(this.classe.getType({})).color;
  }

  getIcon() {
    return this.button.getButtonByType(this.classe.getType({}))?.icon;
  }

  getLabel(champ: string) {
    return this.champLabel[champ] ? this.champLabel[champ] : champ;
  }
}
