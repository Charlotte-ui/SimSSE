import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Node,Trend,Event, Link, NodeType, EventType } from 'src/app/modules/core/models/vertex/node';
import { Button } from 'src/app/modules/core/models/buttons';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.less']
})


export class DialogComponent<T extends Node|Link> { // valable aussi pour les modèles et les règles

  form: FormGroup;
  liste:any[];
  node:T;
  champs;

  numbers = ["rand","min","max","cible","impliques","psy","UR","EU","UA","x","y","parameter","duration"];
  hidden = ["x","y","state","id","type",'links','nodes','typeEvent','counter','root'];
  listable = ["source","target","event",'template','in','out'];
  booleans = ["start"];

  champLabel={
    name:"Nom",
    target:"Cible",
    parameter:"Paramètre",
    event:"Évènement",
    duration:"Durée",
    out:"Depuis",
    in:"Vers"
  }

  title!:string;
  edition!:boolean;

  button = new Button();

  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<DialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: [T,any[],boolean] ) {}

    ngOnInit() {
      this.liste = this.data[1];
      this.node = this.data[0];
      this.edition = this.data[2]
      this.title=this.completeTitle((this.node.type==NodeType.event)?(this.node as Event).typeEvent:this.node.type)
      console.log("create dialog")

      console.log(this.node)
      this.form = this.fb.group(this.node);


      this.setChamp();

    }

    completeTitle(type:string):string{
      let start = (this.edition)?"Modifier":"Ajouter";
      switch(type){
        case NodeType.link: return start+" le lien";
        case EventType.bio: return start+" l'événement";
        case EventType.action: return start+" l'action";
        case NodeType.trend: return start+" la tendance";
        case NodeType.graph: return  start+" le groupe";
        case NodeType.timer: return  start+" le timer";
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
      this.dialogRef.close({delete:true,id:this.node.id});
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
      return elem.template?elem.template.name:elem.event;
    //TODO rendre plus propre
    }

    getColor(node:Node|Link){
      return this.button.getButtonByType((node instanceof Event)?node.typeEvent:node.type).color;
    }

    getIcon(node:Node|Link){
      return this.button.getButtonByType((node.type == NodeType.event)?(node as Event).typeEvent:node.type).icon;
    }

    getLabel(champ:string){
      return this.champLabel[champ]?this.champLabel[champ]:champ;
    }


}







