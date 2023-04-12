import { Component, Input } from '@angular/core';
import { Listable } from '../../core/models/listable';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddRegleDialogComponent } from '../../regles/tab-regles/add-regle-dialog/add-regle-dialog.component';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less']
})
export class ListBoxComponent<T extends Listable> {

  _type:string;
  keys;
  elements!: T[]

  @Input() titre!: string;
  @Input() sousTitre!: string;
  @Input() set type(value:string){
    if(value) {
      this._type = value;
      this.firebaseService.getCollectionById<T>(value).subscribe(
        (elements) =>{
          this.elements = elements
          this.keys = Object.keys(this.elements[0]) as Array<keyof T>;
          const index = this.keys.indexOf("gabarit", 0);
          if (index > -1) this.keys.splice(index, 1);
          }
      );
    }
  };


  ;

  constructor(private router: Router,public firebaseService:FirebaseService,public dialog: MatDialog) {

    this.elements = [];




  }



  addElement(){

    let newElement = {} as T;
    this.keys.forEach(proprety => {
      newElement[proprety]=""
    });


    const dialogRef = this.dialog.open(AddRegleDialogComponent,
      {data: newElement});

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result == undefined) return;

      this.elements.push(result) // add to database with gabarit = true

      console.log(this.elements)



    });

  }


}
