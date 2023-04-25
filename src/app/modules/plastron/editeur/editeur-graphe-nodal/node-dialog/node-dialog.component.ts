import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Node,Trend,Event, Link, NodeType } from 'src/app/modules/core/models/node';
import { Button } from 'src/app/modules/shared/buttons';

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

  numbers = ["x","y","pente","duration"];
  hidden = ["x","y","state","id","type",'links','nodes','typeEvent','counter','root'];
  listable = ["cible","source","target","event",'gabarit'];
  booleans = ["start"];

  titre!:string;

  button = new Button();

  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<NodeDialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: [T,any[],string] ) {}

    ngOnInit() {
      this.liste = this.data[1];
      this.node = this.data[0];
      this.titre = this.data[2] + this.completeTitle(this.node.type)
      console.log("create node dialog")

      console.log(this.node)
      this.form = this.fb.group(this.node);


      this.setChamp();

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

    getValue(elem){
      if ('event' in elem) return elem.event;
      if ('couleur' in elem) return elem.name; // si varible TODO trouver une soluce plus propre
      else return elem.id;
    }

    getName(elem:Node|any){
      if (elem instanceof Node ) return elem.getName();
      else if ("name" in elem) return elem.name;
      return elem.event;
    //TODO rendre plus propre
    }

    getColor(node:Node|Link){
      return this.button.getButtonByType((node instanceof Event)?node.typeEvent:node.type).color;
    }

    getIcon(node:Node|Link){
      return this.button.getButtonByType((node.type == NodeType.event)?(node as Event).typeEvent:node.type).icon;
    }


}







