import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less']
})
export class BarreOutilsComponent implements OnInit {

  @Output() newElement = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
  }

  onClick(element:string){

    this.newElement.emit(element);

  }

}
