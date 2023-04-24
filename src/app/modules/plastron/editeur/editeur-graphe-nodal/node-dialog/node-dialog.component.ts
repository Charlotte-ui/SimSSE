import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Node,Trend,Event, Link } from 'src/app/modules/core/models/node';


@Component({
  selector: 'app-node-dialog',
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.less']
})


export class NodeDialogComponent<T extends Node|Link> {

  form: FormGroup;
  liste:any[];
  node:T|Link;
  champs;

  numbers = ["x","y","pente"];
  hidden = ["x","y","state","id","type",'links','nodes','typeEvent'];
  listable = ["cible","source","target","event",'gabarit'];
  booleans = ["start"];

  titre!:string;


  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<NodeDialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: [(T|Link),any[],string] ) {}

    ngOnInit() {
      this.liste = this.data[1];
      this.node = this.data[0];
      this.titre = this.data[2] + this.completeTitle(this.node.type)
      this.form = this.fb.group(this.node);

      console.log(this.node)

      this.setChamp();

 /*      if (this.node.type == "link"){
        let link = this.node as Link;
        if (link.target) this.form.controls['target'].setValue(link.target.toString());
        if (link.source) this.form.controls['source'].setValue(link.source.toString());
      } */

    }

    completeTitle(type:string):string{
      switch(type){
        case 'link': return " le lien";
        case 'bioevent': return " l'événement";
        case 'action': return " l'action";
        case 'trend': return " la tendance";
        case 'graph': return  " le groupe";
      }
      return "";
    }

  setChamp(){
    this.champs=Object.keys(this.node) as Array<keyof T>;
  }

    onNoClick(): void {
      this.dialogRef.close();
    }

    save() {
      this.dialogRef.close(this.form.value);
    }

    delete() {
      this.dialogRef.close("delete");
    }

    public getType(champ:string){
      if (this.numbers.includes(champ)) return "number"
      if (champ == "couleur") return "color"
      if (this.listable.includes(champ)) return "liste"
      if (this.booleans.includes(champ)) return "boolean"
       return "text";
    }

    public isHidden(champ:string){
      if (this.hidden.includes(champ)) return true;
      return false;
    }

    getColor(node:Node|Link){
      let type:string = node.type;
      if (type == 'event') type+=(node as Event).typeEvent
      switch(type){
        case 'link': return "#90C2E7";
        case 'eventbio': return "#FC9E4F";
        case 'eventaction': return "#73bfb8";
        case 'trend': return "#F2F3AE";
        case 'graph': return  "#F0D3F7";
      }
      return "";
    }

    getIcon(node:Node|Link){
      let type:string = node.type;
      if (type == 'event') type+=(node as Event).typeEvent
      switch(type){
        case 'link': return "arrow_right_alt";
        case 'eventbio': return "healing";
        case 'eventaction': return "touch_app";
        case 'trend': return "trending_up";
        case 'graph': return  "scatter_plot";
        case 'eventstart': return  "input";

      }
      return "";
    }

    getValue(elem){
      if ('event' in elem) return elem.event;
      if ('couleur' in elem) return elem.name; // si varible TODO trouver une soluce plus propre
      else return elem.id;
    }

    getName(elem){
      return ('event' in elem)?elem.event:elem.name;
    }


}







