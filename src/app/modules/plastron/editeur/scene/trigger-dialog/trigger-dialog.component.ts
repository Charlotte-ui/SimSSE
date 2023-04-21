import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event ,Node} from 'src/app/modules/core/models/node';

@Component({
  selector: 'app-trigger-dialog',
  templateUrl: './trigger-dialog.component.html',
  styleUrls: ['./trigger-dialog.component.less']
})
export class TriggerDialogComponent {
  form: FormGroup;
  events:[Event,number,number][];
  isEdition!:boolean;
  titre!:string;
  validate!:string;



  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<TriggerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [{},[Event,number,number][],boolean] ) {}

    ngOnInit() {
      console.log(this.data[0])
    //  console.log(this.data[0])

      this.form = this.fb.group(this.data[0]);
      this.events = this.data[1]
      this.isEdition = this.data[2];

      if (this.isEdition) {
        this.form.get('eventId')?.disable();
        this.titre = "Modifier le trigger"
        this.validate = "Enregistrer les modifications"
      }
      else {
        this.titre = "Ajouter un trigger"
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

    getIcon(node:Node){
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

}
