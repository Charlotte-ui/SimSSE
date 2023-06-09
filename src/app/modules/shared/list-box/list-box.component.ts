import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Listable } from '../../../models/interfaces/listable';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogComponent } from '../dialog/dialog.component';
import { ApiService } from '../../../services/api.service';
import { Scenario } from '../../../models/vertex/scenario';
import { Vertex } from '../../../models/vertex/vertex';
import { TagService } from '../../../services/tag.service';
import { concat, filter, finalize, switchMap, zipAll } from 'rxjs';
import { Tag } from '../../../models/vertex/tag';
import { Modele, Triage } from '../../../models/vertex/modele';
import { Button } from 'src/app/functions/display';
import { WaitComponent } from '../wait/wait.component';
import { deleteElementFromArray } from 'src/app/functions/tools';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less'],
})
export class ListBoxComponent<T extends Listable> {
  keys;
  elements!: T[];
  triages: Triage[] = [Triage.EU, Triage.UA, Triage.UR];
  filtreActif: boolean = false;

  filterTag!: string[];
  filterTriage!: string[];

  filterTagElement!: string[];
  filterTriageElement!: string[];

  button = new Button();

  selectAll: boolean = false;

  @Input() chips!: Tag[];
  @Input() title!: string;

  @Input() service;

  _classe: typeof Vertex | typeof Scenario | typeof Modele;
  get classe(): typeof Vertex {
    return this._classe;
  }
  @Input() set classe(value: typeof Vertex) {
    if (value) {
      this._classe = value;

      this.tagService
        .getAllTags(this.classe.className.toLowerCase())
        .subscribe((response) => {
          this.chips = response;
        });

      value
        .getListTemplate<T>(this.apiService)
        .pipe(
          switchMap((elements: T[]) => {
            const requests = elements.map((element: T) =>
              this.tagService.getTags(element.id, value.className)
            );

            this.intElements(elements);

            return concat(requests).pipe(
              zipAll(),
              finalize(() => {})
            );
          })
        )
        .subscribe((TagsArray: Tag[][]) => {
          this.elements.map((element: T, index: number) => {
            element.tags = new Map(TagsArray[index].map((tag:Tag) => [tag.id, tag]));
          });
        });
    }
  }

  @Output() newElement = new EventEmitter<T>();

  constructor(
    public apiService: ApiService,
    public dialog: MatDialog,
    public tagService: TagService,
    private router: Router
  ) {
    this.elements = [];
    this.filterTagElement = [];
    this.filterTriageElement = [];
  }

  ngOnInit(): void {}

  intElements(elements: T[]) {
    this.elements = elements;
    this.filterTagElement = [...elements.map((element) => element.title)];
    this.filterTriageElement = [...elements.map((element) => element.title)];

    this.keys = Object.keys(this.elements[0]) as Array<keyof T>;

    deleteElementFromArray(this.keys, 'template');
  }

  addElement() {
    let newElement = new this.classe({ template: true });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [newElement, this.classe, this.triages, false, ['template']],
    });

    dialogRef.afterClosed().subscribe((result: T) => {
      if (result) {
        this.createElement(result);
      }
    });
  }

  createElement(element: T) {
    this.dialog.open(WaitComponent);
    this.service.createElement(element).subscribe((id) => {
      if (Array.isArray(id)) id = id[0];
      this.elements.push(element);
      this.router.navigate([`/${this.classe.className.toLowerCase()}/` + id]);
      this.dialog.closeAll();
    });
  }

  drop(event: CdkDragDrop<T[]>) {
    moveItemInArray(this.elements, event.previousIndex, event.previousIndex);
  }

  changeFilterTag(event) {
    this.filterTag = event.value;
    this.filterTagElement = [];
    this.elements.forEach((element) => {
      if (
        Array.from(element.tags).filter(([key,tag]) => this.filterTag.includes(tag.value))
          .length > 0
      ) {
        this.filterTagElement.push(element.title);
      }
    });

    this.changeFilter();
  }

  changeFilterTriage(event) {
    this.filterTriage = event.value;
    this.filterTriageElement = [];
    this.elements.forEach((element) => {
      if (this.filterTriage.indexOf(element['triage']) >= 0)
        this.filterTriageElement.push(element.title);
    });

    this.changeFilter();
  }

  changeFilter() {
    this.elements.forEach((element) => {
      if (
        this.filterTagElement.indexOf(element.title) >= 0 &&
        this.filterTriageElement.indexOf(element.title) >= 0
      )
        element['show'] = true;
      else element['show'] = false;
    });

    this.filtreActif = true;
  }

  deleteFilter() {
    this.selectAll = true;
    this.filterTriage = [];
    this.filterTag = [];
    this.filterTriageElement = [];
    this.filterTagElement = [];
    this.elements.map((element) => {
      element['show'] = true;
      this.filterTagElement.push(element.title);
      this.filterTriageElement.push(element.title);
    });
    this.filtreActif = false;
    this.selectAll = false;
  }

  getColor() {
    return Button.getButtonByType(this.classe.getType({})).color;
  }

  getIcon() {
    return Button.getButtonByType(this.classe.getType({}))?.icon;
  }
}
