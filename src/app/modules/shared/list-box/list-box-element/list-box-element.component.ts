import { Component, Input } from '@angular/core';
import { List } from 'echarts';
import { Listable } from 'src/app/modules/core/models/listable';

@Component({
  selector: 'app-list-box-element',
  templateUrl: './list-box-element.component.html',
  styleUrls: ['./list-box-element.component.less']
})
export class ListBoxElementComponent {

  _element!:Listable;
  get element():  Listable{
    return this._element;
  }
  @Input() set element(value:Listable){
    this._element = value;
    console.log(value)
  }


  removeElement(){

  }

  editElement(){

  }

}
