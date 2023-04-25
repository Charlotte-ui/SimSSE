import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Button, IButton } from 'src/app/modules/core/models/buttons';



@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less']
})
export class BarreOutilsComponent implements OnInit {

  @Output() newElement = new EventEmitter<string>();

  buttons!:IButton[];

  constructor() {
    this.buttons = Button.buttons;
  }

  ngOnInit(): void {
  }

  onClick(element:string){
    this.newElement.emit(element);
  }

}
