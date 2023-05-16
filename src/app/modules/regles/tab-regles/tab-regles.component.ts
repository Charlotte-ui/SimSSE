import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { Vertex } from '../../../models/vertex/vertex';
import { Action, BioEvent } from 'src/app/models/vertex/node';
import { Button } from 'src/app/models/buttons';
import { RegleService } from 'src/app/services/regle.service';

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

  champLabel = {
    name: 'Nom',
    title: 'Titre',
    target: 'Cible',
    parameter: 'Paramètre',
    event: 'Évènement',
    duration: 'Durée',
    out: 'Depuis',
    in: 'Vers',
    description: 'Description',
    psy: 'Nombre de cas psy',
    impliques: "Nombre d'impliqués sans cas clinique",
    UA: "Nombre d'urgence absolue (UA)",
    UR: "Nombre d'urgence relative (UR)",
    EU: "Nombre d'extrême urgence (EU)",
    triage: 'Triage',
    rand: 'Ecart-type',
    defaultValue: 'Valeur par défaut',
    min: 'Valeur minimum',
    max: 'Valeur maximum',
    color: 'Couleur',
  };

  button = new Button();

  @Input() classe: typeof Vertex;

  get elements(): T[] {
    return this._elements;
  }
  @Input() set elements(value: T[]) {
    if (value?.length > 0) {
      this._elements = value;
      this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
      this.displayedColumns = [...this.keys];

      const index = this.displayedColumns.indexOf('id', 0);
      if (index > -1) this.displayedColumns.splice(index, 1);

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
    console.log('openDialog');

    console.log(element);
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [element, this.classe, [], edit],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

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

      console.log(this.elements);

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
      console.log(result);

      if (result) {
        this.regleService.deleteRegle(this.elements[id].id).subscribe(() => {
          this.elements.splice(id, 1);
          this.elements = [...this.elements];
        });
      }
    });
  }

  isColor(column: string) {
    //S console.log("isColor "+column)
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
