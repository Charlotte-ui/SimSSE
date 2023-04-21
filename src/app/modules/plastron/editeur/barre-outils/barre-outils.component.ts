import { Component, EventEmitter, OnInit, Output } from '@angular/core';

interface Button{
  name:string,
  type:string,
  icon:string,
  color:string
}

@Component({
  selector: 'app-barre-outils',
  templateUrl: './barre-outils.component.html',
  styleUrls: ['./barre-outils.component.less']
})
export class BarreOutilsComponent implements OnInit {

  @Output() newElement = new EventEmitter<string>();

  buttons!:Button[];


  constructor() {

    this.buttons = [
      {name:"Tendance",type:'trend',icon:'trending_up',color:'#F2F3AE'},
      {name:"Action",type:'action',icon:'touch_app',color:'#73bfb8'},
      {name:"Évenement",type:'bioevent',icon:'healing',color:'#FC9E4F'},//local_hospital
      {name:"Connection",type:'link',icon:'arrow_right_alt',color:'#90C2E7'},
      {name:"Groupe",type:'group',icon:'scatter_plot',color:'#F0D3F7'},

    ]


  }

  ngOnInit(): void {
  }

  onClick(element:string){
    this.newElement.emit(element);
  }

}
