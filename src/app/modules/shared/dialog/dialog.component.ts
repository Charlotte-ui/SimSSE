import { Component, OnInit, Inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
  LinkType,
} from 'src/app/models/vertex/node';
import { Button, champLabel } from 'src/app/functions/display';
import { Scenario } from '../../../models/vertex/scenario';
import { Modele } from '../../../models/vertex/modele';
import { Vertex } from '../../../models/vertex/vertex';
import { getElementByChamp } from 'src/app/functions/tools';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.less'],
})
export class DialogComponent<T extends Node | Link | Modele | Scenario> {
  // valable aussi pour les modèles et les règles

  form: FormGroup;
  map: Map<string,any>;
  element: T;
  classe: typeof Vertex;
  champs;

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
    'timeStamps',
    'PMAx',
    'PMAy',
    'CADIx',
    'CADIy',
    'PRVx',
    'PRVy',
  ];


  champLabel = champLabel;

  required = ['title', 'triage','name','target','parameter','event','duration','in','out','groupToStore'];

  title!: string;
  edition!: boolean;

  button = new Button();

  getType = Button.getType ;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA)
    public data: [T, typeof Vertex, Map<string,any>, boolean, string[]],
  ) {}

  ngOnInit() {
    this.element = structuredClone(this.data[0]);
    console.log('this.element ',this.element)
    this.classe = this.data[1];
    this.map = this.data[2];
    this.edition = this.data[3];
    console.log('this.map ',this.map)

    let newHidden = this.data.length > 4 ? this.data[4] : []; // les nouveaux hidden sont optionnels

    this.title = this.completeTitle(this.classe.getType(this.element));

    Object.keys(this.element).forEach(key => { // avoid the error  this.validator is not a function
      if (Array.isArray(this.element[key])) delete this.element[key];
    });

    this.form = this.fb.group(this.element);

    this.champs = Object.keys(this.element) as Array<keyof T>;

    this.champs.map((champ: string) => {
      if (this.required.includes(champ))
        this.form.controls[champ].addValidators(Validators.required); //this.formControls[champ] = new FormControl('', [Validators.required]);
    });

    this.form.valueChanges.subscribe((newElement: T) => {
      console.log("new element ",newElement)
      console.log("this.element ",this.element)
      if (newElement['template'] !== undefined && this.element['name'] && this.element['template'] !== newElement['template']){
        this.element['template'] = newElement['template'];
        this.element['name'] = this.map.get(this.element['template']).name
        this.form.controls['name'].setValue(this.element['name']);
        console.log("name ",this.element['name'])
      }

      console.log("this.element['target'] ",this.element)
      if (newElement['target'] !== undefined && this.element['name'] && this.element['target'] !== newElement['target']){
        this.element['target'] = newElement['target'];
        this.element['name'] = this.map.get(this.element['target']).name
        this.form.controls['name'].setValue(this.element['name']);
        console.log("name ",this.element['name'])
      }
    });

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
    return start + ' un ' + type;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.isErrorInForm();
    this.dialogRef.close(this.form.value);
  }

  delete() {
    this.dialogRef.close({ delete: true, id: this.element.id });
  }

  

  public isHidden(champ: string) {
    if (this.hidden.includes(champ)) return true;
    return false;
  }

  getValue(elem) {
    if (typeof elem === 'string') return elem;
   // if ('event' in elem) return elem.event;
    if ('couleur' in elem)
      return elem.name; // si varible TODO trouver une soluce plus propre
    else return elem.id;
  }

  getName(elem: any) {
    if (typeof elem === 'string') return elem;
    if ('name' in elem) return elem.name;
    if (elem instanceof Node) {
      return Node.getName(elem);
    } else 
    return elem.template ? elem.template.name : elem.event;
    //TODO rendre plus propre
  }

  getColor(element: T) {
    return Button.getButtonByType(
      element instanceof Event ? element.typeEvent : Node.getType(element)
    )?.color;
  }

  getIcon(element: T) {
    return Button.getButtonByType(this.classe.getType(element))?.icon;
  }

  getLabel(champ: string) {
    return this.champLabel[champ] ? this.champLabel[champ] : champ;
  }

  getGroup(champ: string) {
    if (champ == 'trigger') return Object.values(LinkType)
    else return ['Vrai','Faux']
    
  }

  // Get all Form Controls keys and loop them
  isErrorInForm(): boolean {
    let res = false;
    Object.keys(this.form.controls).forEach((key) => {
      // Get errors of every form control
      if (this.form.get(key).errors) res = true;
    });
    return res;
  }
}
