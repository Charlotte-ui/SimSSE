import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDeleteDialogComponent } from 'src/app/modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { Listable } from 'src/app/models/interfaces/listable';
import { WaitComponent } from '../../wait/wait.component';
import { Image, ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-list-box-element',
  templateUrl: './list-box-element.component.html',
  styleUrls: ['./list-box-element.component.less'],
})
export class ListBoxElementComponent<T extends Listable> {
  
  image:Image;
  
  _element!: T;

  get element(): T {
    return this._element;
  }
  @Input() set element(value: T) {
    this._element = value;
    if (!this.element['triage']){
      this.imageService.getImageCover(this.element.id).subscribe((image:Image)=>{
        this.image = image;
        console.log('image cover ',this.element.title," ",image)
        
      })
    }

  }

  @Input() type: string;
  @Input() service;

  constructor(private router: Router, public dialog: MatDialog, private imageService:ImageService) {}

  removeElement() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: [
        'Supprimer ' + this.element.title,
        'Voulez-vous supprimer le ' +
          this.type +
          ' ' +
          this.element.title +
          ' ? Tout les plastrons associés seront aussi supprimés.',
      ],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialog.open(WaitComponent);
        this.service.deleteElement(this.element).subscribe(() => {
          this.element = undefined;
          this.dialog.closeAll();
        });
      }
    });
  }

  goToElement(elementId: string) {
    this.router.navigate(['/' + this.type.toLowerCase() + '/' + elementId]);
  }
}
