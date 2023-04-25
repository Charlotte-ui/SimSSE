import { E } from "@angular/cdk/keycodes";
import { EventType, NodeType } from "../core/models/node";

export interface IButton{
  name:string,
  type:string,
  icon:string,
  color:string,
  outils:boolean, // le bouton est-il dans la barre d'outils ?
  symbol:string
}


export class Button{

  static buttons: IButton[]= [
    {name:"Tendance",type:NodeType.trend,icon:'timeline',color:'#F2F3AE',outils:true,symbol: 'roundRect'},
    {name:"Action",type:EventType.action,icon:'touch_app',color:'#73bfb8',outils:true,symbol: 'roundRect'},
    {name:"Évenement",type:EventType.bio,icon:'healing',color:'#FC9E4F',outils:true,symbol: 'roundRect'},
    {name:"Timer",type:NodeType.timer,icon:'access_alarm',color:'#C8FFBE',outils:true,symbol: 'roundRect'},
    {name:"Lien",type:NodeType.link,icon:'arrow_right_alt',color:'#90C2E7',outils:true,symbol: 'roundRect'},
    {name:"Groupe",type:NodeType.graph,icon:'scatter_plot',color:'#F0D3F7',outils:true,symbol: 'roundRect'},
    {name:"Start",type:EventType.start,icon:'input',color:'#FFFFFF',outils:false,symbol:'rect'},
  //  {name:"End",type:EventType.start,icon:'output',color:'#FFFFFF',outils:false},
  ]

  constructor(){}

  public getButtonByType(type:string):IButton|undefined{
    let res = Button.buttons[0];
    Button.buttons.forEach(button => {
      if (type == button.type) res= button;
    });
    return res;
  }
};
