import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-regle-dialog',
  templateUrl: './add-regle-dialog.component.html',
  styleUrls: ['./add-regle-dialog.component.less']
})
export class AddRegleDialogComponent<T> {
  element!: T;
  form: FormGroup;
  champs;

  numbers = ["rand","min","max","cible","impliques","psy","UR","EU","UA"];

  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<AddRegleDialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: T) {}

    ngOnInit() {
      this.element = this.data;

      this.form = this.fb.group(this.element);
      this.champs=Object.keys(this.element) as Array<keyof T>;
      const index = this.champs.indexOf("id", 0);
      if (index > -1) this.champs.splice(index, 1);
      console.log(this.champs)
  }

    onNoClick(): void {
      this.dialogRef.close();
    }

    save() {
      this.dialogRef.close(this.form.value);
    }

    public getType(champ:string){
    if (this.numbers.includes(champ)) return "number"
    if (champ == "couleur") return "color"
     return "text";
    }


}
