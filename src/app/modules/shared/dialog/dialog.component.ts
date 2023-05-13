import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  Node,
  Trend,
  Event,
  Link,
  NodeType,
  EventType,
} from 'src/app/models/vertex/node';
import { Button } from 'src/app/models/buttons';
import { Scenario } from '../../../models/vertex/scenario';
import { Modele } from '../../../models/vertex/modele';
import { Vertex } from '../../../models/vertex/vertex';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.less'],
})
export class DialogComponent<T extends Node | Link | Modele | Scenario> {
  // valable aussi pour les modèles et les règles

  form: FormGroup;
  liste: any[];
  element: T;
  classe: typeof Vertex;
  champs;

  numbers = [
    'rand',
    'min',
    'max',
    'cible',
    'impliques',
    'psy',
    'UR',
    'EU',
    'UA',
    'x',
    'y',
    'parameter',
    'duration',
  ];
  hidden = [
    'x',
    'y',
    'state',
    'id',
    'type',
    'links',
    'nodes',
    'typeEvent',
    'counter',
    'root',
    'image',
    'tags',
    'graph',
    'triggeredEvents',
    'timeStamps'
  ];
  listable = ['source', 'target', 'event', 'template', 'in', 'out','triage'];
  booleans = ['start'];

  champLabel = {
    name: 'Nom',
    title: 'Titre',
    target: 'Cible',
    parameter: 'Paramètre',
    event: 'Évènement',
    duration: 'Durée',
    out: 'Depuis',
    in: 'Vers',
    description:'Description',
    psy:'Nombre de cas psy',
    impliques:"Nombre d'impliqués sans cas clinique",
    UA:"Nombre d'urgence absolue (UA)",
    UR:"Nombre d'urgence relative (UR)",
    EU:"Nombre d'extrême urgence (EU)",
    triage:"Triage",
    rand:"Ecart-type",
    defaultValue:"Valeur par défaut",
    min:"Valeur minimum",
    max:"Valeur maximum",
    color:"Couleur",
  };

  required = ["title","triage"];

  title!: string;
  edition!: boolean;

  button = new Button();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: [T, typeof Vertex,any[], boolean,string[]]
  ) {}

  ngOnInit() {
    this.element = this.data[0];
    this.classe = this.data[1];
    this.liste = this.data[2];
    this.edition = this.data[3];
    let newHidden = this.data.length>4?this.data[4]:[]; // les nouveaux hidden sont optionnels
    
    this.title = this.completeTitle(this.classe.getType(this.element));
    this.form = this.fb.group(this.element);

    this.champs = Object.keys(this.element) as Array<keyof T>;

    this.champs.map((champ:string)=>{
      if (this.required.includes(champ)) this.form.controls[champ].addValidators(Validators.required)//this.formControls[champ] = new FormControl('', [Validators.required]);
    })

    this.hidden = this.hidden.concat(newHidden);
  }

  completeTitle(type: string): string {
    let start = this.edition ? 'Modifier' : 'Ajouter';
    switch (type) {
      case NodeType.link:
        return start + ' le lien';
      case EventType.bio:
        return start + " l'événement";
      case EventType.action:
        return start + " l'action";
      case NodeType.trend:
        return start + ' la tendance';
      case NodeType.graph:
        return start + ' le groupe';
      case NodeType.timer:
        return start + ' le timer';
    }
    return start +" un " + type;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    console.log("this.form.value")
    console.log(this.form.value)
    this.dialogRef.close(this.form.value);
  }

  delete() {
    this.dialogRef.close({ delete: true, id: this.element.id });
  }

  public getType(champ: string) {
    if (this.numbers.includes(champ)) return 'number';
    if (champ == 'color') return 'color';
    if (this.listable.includes(champ)) return 'liste';
    if (this.booleans.includes(champ)) return 'boolean';
    return 'text';
  }

  public isHidden(champ: string) {
    if (this.hidden.includes(champ)) return true;
    return false;
  }

  getValue(elem) {
    if(typeof elem === "string") return elem;
    if ('event' in elem) return elem.event;
    if ('couleur' in elem)
      return elem.name; // si varible TODO trouver une soluce plus propre
    else return elem.id;
  }

  getName(elem: Node | any) {
    if(typeof elem === "string") return elem;
    if (elem instanceof Node) {
      console.log("elem instance of node")
      return Node.getName(elem);
    }
    else if ('name' in elem) return elem.name;
    return elem.template ? elem.template.name : elem.event;
    //TODO rendre plus propre
  }

  getColor(element: T) {
    return this.button.getButtonByType(
      element instanceof Event ? element.typeEvent : Node.getType(element)
    )?.color;
  }

  getIcon(element: T) {
    return this.button.getButtonByType(this.classe.getType(element))?.icon;
  }

  getLabel(champ: string) {
    return this.champLabel[champ] ? this.champLabel[champ] : champ;
  }
}
