import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less']
})
export class BarreOutilsComponent implements OnInit {

  @Output() newNode = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
  }

  onClick(node:string){
    this.newNode.emit(node);

  }

}
