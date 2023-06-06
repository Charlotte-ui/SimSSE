import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.less']
})
export class ConfirmDeleteDialogComponent {
  message!:string;
  title!:string;

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [string,string]) {}

    ngOnInit() {
      this.title = this.data[0];
      this.message = this.data[1];

  }

    yes(): void {
      this.dialogRef.close(true);
    }

    no() {
      this.dialogRef.close(false);
    }

}
