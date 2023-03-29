import { Component, OnInit } from '@angular/core';
import { Trend,Event } from '../../core/models/node';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.less']
})
export class EditeurComponent implements OnInit {



 trend1:Trend = {
  id:"1",
  name: 'Tendance 1',
  x: 300,
  y: 300,
  type:'trend',
  cible:'SpO2',
  pente:-1
}

trend2:Trend = {
  id:"2",
  name: 'Tendance 2',
  x: 800,
  y: 300,
  type:'trend',
  cible:'FR',
  pente:1
}
event:Event = {
  id:"3",
  name: 'Event 1',
  x: 550,
  y: 100,
  type:'event',
  event:'oxygénothérapie'
}



  data = [this.trend1,this.trend2,this.event]

  links=[]

  constructor() { }

  ngOnInit(): void {
  }

}
