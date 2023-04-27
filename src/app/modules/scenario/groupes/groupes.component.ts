import { Component, Input } from '@angular/core';
import { Groupe } from '../../core/models/groupe';
import { MatDialog } from '@angular/material/dialog';
import { Scenario } from '../../core/models/scenario';
import { ConfirmDeleteDialogComponent } from '../../core/confirm-delete-dialog/confirm-delete-dialog.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.component.html',
  styleUrls: ['./groupes.component.less'],
})
export class GroupesComponent {
  groupPositions = [
    [56.5, 20, '1'],
    [46.5, 30, '2'],
    [22.1, 40, '3'],
    [15, 15],
    [50, 10],
    [20, 50],
  ];

  editable: string[] = ['psy', 'impliques'];
  keysGroup: string[] = ['UR', 'UA', 'EU', 'psy', 'impliques'];
  displayedColumnsGroup: string[] = [
    'scene',
    'UR',
    'UA',
    'EU',
    'psy',
    'impliques',
    'delete',
  ];
  dataSourceGroup = [];

  @Input() scenario: Scenario;

  _groupes: Groupe[];

  get groupes(): Groupe[] {
    return this._groupes;
  }
  @Input() set groupes(value: Groupe[]) {
    if (value) {
      // if value isnt undefined
      this._groupes = value;
      this.dataSourceGroup = value;
    }
  }

  constructor(public dialog: MatDialog) {}

  addGroup() {
    let newGroup: Partial<Groupe> = {
      impliques: 0,
      EU: 0,
      UA: 0,
      UR: 0,
      psy: 0,
    };

    this.openDialog(newGroup, -1);
  }

  editGroup(id: number) {
    delete this.dataSourceGroup[id].scenario;
    delete this.dataSourceGroup[id].scene;

    this.openDialog(this.dataSourceGroup[id], id);
  }

  openDialog(element: Partial<Groupe>, id: number) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: [element, [], false],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result == undefined) return;

      if (Number(id) >= 0) {
        result['scene'] = id + 1;
        this.dataSourceGroup[Number(id)] = result; // TODO database add with scenario id
      } else {
        result['scene'] = this.dataSourceGroup.length + 1;
        result['scenario'] = this.scenario.id;
        this.dataSourceGroup.push(result);
      }

      console.log(this.dataSourceGroup);

      this.dataSourceGroup = [...this.dataSourceGroup];
    });
  }

  getTotal(proprerty: string) {
    let res = 0;
    this.dataSourceGroup.forEach((group) => {
      res += Number(group[proprerty]);
    });
    return res;
  }

  public removeGroup(groupId: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: 'groupe ' + this.dataSourceGroup[groupId]['scene'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result) this.dataSourceGroup.splice(groupId, 1);

      this.dataSourceGroup = [...this.dataSourceGroup];
    });
  }

  public isEditable(champ: string) {
    if (this.editable.includes(champ)) return true;
    return false;
  }
}
