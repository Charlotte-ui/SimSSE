import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab-regles',
  templateUrl: './tab-regles.component.html',
  styleUrls: ['./tab-regles.component.less']
})


export class TabReglesComponent <T>{

  
  _elements!: T[];
  displayedColumns;
  dataSource!: T[];

  get elements():  T[] {
    return this._elements;
}
@Input() set elements(value:T[] ) {
  if (value!=undefined){
    this._elements = value;
    this.displayedColumns=Object.keys(this.elements[0]) as Array<keyof T>;
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

  constructor(){

  }

  addElement(){

  }

  editElement(id:number){

  }

  removeElement(id:number){
    
  }


}
