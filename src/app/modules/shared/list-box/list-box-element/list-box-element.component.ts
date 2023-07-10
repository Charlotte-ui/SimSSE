import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDeleteDialogComponent } from 'src/app/modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { Listable } from 'src/app/models/interfaces/listable';
import { WaitComponent } from '../../wait/wait.component';
import { Image, ImageService } from 'src/app/services/image.service';
import { switchMap } from 'rxjs';
import { Graph } from 'src/app/models/vertex/node';
import { NodeService } from 'src/app/services/node.service';
import { Modele } from 'src/app/models/vertex/modele';

@Component({
  selector: 'app-list-box-element',
  templateUrl: './list-box-element.component.html',
  styleUrls: ['./list-box-element.component.less'],
})
export class ListBoxElementComponent<T extends Listable> {
  image: Image;

  _element!: T;

  get element(): T {
    return this._element;
  }
  @Input() set element(value: T) {
    this._element = value;
    if (!this.element['triage']) {
      this.imageService
        .getImageCover(this.element.id)
        .subscribe((image: Image) => {
          this.image = image;
        });
    }
  }

  @Input() type: string;
  @Input() service;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private imageService: ImageService,
    private nodeService: NodeService
  ) {}

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

  duplicateElement() {
    // let newElement = structuredClone(this.element);
    // newElement.title = "copie de "+newElement.title;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: ['Duppliquer ' + this.element.title + ' ?'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialog.open(WaitComponent);

        this.element
          .dupplicate(this.service, this.nodeService)
          .pipe(
            switchMap((newElement: T) =>{
              console.log("newElement ",newElement)
              return this.service.duplicateElement(newElement,true)
            }
              
            )
          )
          .subscribe((id) => {
            if (Array.isArray(id)) id = id[0];
            this.router.navigate([`/${this.type.toLowerCase()}/` + id]);
            this.dialog.closeAll();
          });
      }
    });
  }

  goToElement(elementId: string) {
    this.router.navigate(['/' + this.type.toLowerCase() + '/' + elementId]);
  }
}
