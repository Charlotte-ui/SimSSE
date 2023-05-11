import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { List } from 'echarts';
import { ConfirmDeleteDialogComponent } from 'src/app/modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { Listable } from 'src/app/modules/core/models/interfaces/listable';
import { ApiService } from 'src/app/modules/core/services/api.service';

@Component({
  selector: 'app-list-box-element',
  templateUrl: './list-box-element.component.html',
  styleUrls: ['./list-box-element.component.less'],
})
export class ListBoxElementComponent<T extends Listable> {
  _element!: T;

  get element(): T {
    return this._element;
  }
  @Input() set element(value: T) {
    this._element = value;
  }

  @Input() type: string;

  constructor(private router: Router, public dialog: MatDialog, private apiService:ApiService) {}

  removeElement() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: this.element.title,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result) {
        this.apiService.deleteDocument(this.element.id).subscribe(()=>{
          this.element = undefined;
        }
          
        )

        // delete element from database
      }
    });
  }

  goToElement(elementId: string) {
    console.log(elementId);
    this.router.navigate(['/' + this.type.toLowerCase() + '/' + elementId]);
  }
}
