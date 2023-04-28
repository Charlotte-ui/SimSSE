import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event ,Node} from 'src/app/modules/core/models/node';
import { Button } from 'src/app/modules/core/models/buttons';

@Component({
  selector: 'app-trigger-dialog',
  templateUrl: './trigger-dialog.component.html',
  styleUrls: ['./trigger-dialog.component.less']
})
export class TriggerDialogComponent {
  form: FormGroup;
  events:[Event,number,number][];
  isEdition!:boolean;
  title!:string;
  validate!:string;
  noEditable:boolean=false;
  icon = "flash_on";
  id = "flash";

  button:Button = new Button()

  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<TriggerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [{},[Event,number,number][],boolean] ) {}

    ngOnInit() {
      console.log("init trigger dialog")

      console.log(this.data[0])
    //  console.log(this.data[0])

      this.form = this.fb.group(this.data[0]);
      this.events = this.reduceEventArray(this.data[1])
      this.events.forEach(event => {

      });


      this.isEdition = this.data[2];

      if (this.isEdition) {
        if(Number.isNaN(Number(this.data[0]['event']))) { // if the trigger is a event
          this.form.get('event')?.disable();
          this.title = "Modifier le trigger "+this.data[0]['name']
          this.validate = "Enregistrer les modifications"
        }
        else{
          this.noEditable = true;
          this.icon = "access_alarm";
          this.id = "time";
          this.title = "Vous ne pouvez pas déplacer la fin du timer"
        }

      }
      else {
        this.title = "Ajouter un trigger"
        this.validate = "Ajouter"


      }

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


    /**
     * reduit la liste des evenements pour ne pas les afficher en double s'ils sont  présent plusieurs fois dans le Graph
     * enlève les événement start et end
     * @param array
     * @returns
     */
    private reduceEventArray(array: [Event,number,number][]): [Event,number,number][]{
      let arrayTemp:string[] = ["start","end"];
      return array.reduce((acc: [Event,number,number][], cur: [Event,number,number]) => {
        if (!arrayTemp.includes(cur[0].event)) {
            arrayTemp.push(cur[0].event)
              acc.push(cur);
          }
          return acc;
      }, [])
  }

}
