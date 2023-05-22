import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event, Node } from 'src/app/models/vertex/node';
import { Button } from 'src/app/functions/display';

@Component({
  selector: 'app-trigger-dialog',
  templateUrl: './trigger-dialog.component.html',
  styleUrls: ['./trigger-dialog.component.less'],
})
export class TriggerDialogComponent {
  form: FormGroup;
  events: Event[];
  isEdition!: boolean;
  title!: string;
  validate!: string;
  noEditable: boolean = false;
  element: string;
  trigger;
  isTrigger: boolean;

  button: Button = new Button();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TriggerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [{}, Event[], boolean, boolean]
  ) {}

  ngOnInit() {
    this.trigger = this.data[0];
    this.isEdition = this.data[2];
    this.isTrigger = this.data[3];
    this.element = this.isTrigger ? 'trigger' : 'timestamp';
    console.log('edit trigger ', this.trigger);
    this.form = this.fb.group(this.trigger,Validators.required);
    this.events = this.data[1];

    
    if (this.isEdition) {
      if (this.trigger.editable) {
        // if the trigger is a event
        this.form.get('in')?.disable();
        this.title = `Modifier le ${this.element} ${this.data[0]['name']}`;
        this.validate = 'Enregistrer les modifications';
      } else {
        this.noEditable = true;
        this.title = 'Vous ne pouvez pas déplacer la fin du timer';
      }
    } else {
      this.title = `Ajouter un ${this.element}`;
      this.validate = 'Ajouter';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  delete() {
    this.dialogRef.close({ delete: true, id: this.trigger.id });
  }

  /**
   * reduit la liste des evenements pour ne pas les afficher en double s'ils sont  présent plusieurs fois dans le Graph
   * enlève les événement start et end
   * @param array
   * @returns
   */
  private reduceEventArray(
    array: [Event, number, number][]
  ): [Event, number, number][] {
    let arrayTemp: string[] = ['start', 'end'];
    return array.reduce(
      (acc: [Event, number, number][], cur: [Event, number, number]) => {
        if (!arrayTemp.includes(cur[0].event)) {
          arrayTemp.push(cur[0].event);
          acc.push(cur);
        }
        return acc;
      },
      []
    );
  }

  getColor() {
    return this.button.getButtonByType(this.element)?.color;
  }

  getIcon() {
    return this.button.getButtonByType(this.element)?.icon;
  }
}
