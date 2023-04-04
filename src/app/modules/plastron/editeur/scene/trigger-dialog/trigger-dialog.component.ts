import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-trigger-dialog',
  templateUrl: './trigger-dialog.component.html',
  styleUrls: ['./trigger-dialog.component.less']
})
export class TriggerDialogComponent {
  form: FormGroup;

  
  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<TriggerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {} ) {}

    ngOnInit() {
      console.log(this.data)
    //  console.log(this.data[0])

      this.form = this.fb.group(this.data[0]);
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

}
