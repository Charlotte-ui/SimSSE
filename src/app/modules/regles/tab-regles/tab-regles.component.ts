import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRegleDialogComponent } from './add-regle-dialog/add-regle-dialog.component';
import { VariablePhysio } from '../../core/models/variablePhysio';
import { ConfirmDeleteDialogComponent } from '../../core/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-tab-regles',
  templateUrl: './tab-regles.component.html',
  styleUrls: ['./tab-regles.component.less']
})


export class TabReglesComponent <T>{


  _elements!: T[];
  keys;
  displayedColumns;
  dataSource!: T[];

  get elements():  T[] {
    return this._elements;
}
@Input() set elements(value:T[] ) {
  if (value!=undefined){
    this._elements = value;
    this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
    this.displayedColumns= [...this.keys]

    const index = this.displayedColumns.indexOf("id", 0);
    if (index > -1) this.displayedColumns.splice(index, 1);
    this.displayedColumns.push("edit");
    this.displayedColumns.push("delete");
    console.log(this.displayedColumns);
    this.dataSource = this.elements;

  }
}

@Input() titre:string;
@Input() description:string;

  constructor(public dialog: MatDialog){

  }

  addElement(){

    let newElement = {} as T;
    this.keys.forEach(proprety => {
      newElement[proprety]=""

    });

    this.openDialog(newElement,-1);



  }

  editElement(id:number){

    this.openDialog(this.elements[id],id);

  }

  openDialog(element:T,id:number){
    const dialogRef = this.dialog.open(AddRegleDialogComponent,
      {data: element});

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result == undefined) return;

      if(Number(id)>=0) this.dataSource[Number(id)] = result;
      else this.dataSource.push(result)

      console.log(this.dataSource)

      this.dataSource = [... this.dataSource]


    });

  }

  removeElement(id:number){

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent,
      {data: this.elements[id]['nom']});

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result) this.dataSource.splice(id, 1);


      this.dataSource = [... this.dataSource]


    });

  }

  isColor(column:string){
    console.log("isColor "+column)
    if (column == "couleur") return true;
    return false;
  }


}
