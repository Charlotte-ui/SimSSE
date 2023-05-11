import { Component, Input } from '@angular/core';
import { Groupe } from '../../core/models/vertex/groupe';
import { MatDialog } from '@angular/material/dialog';
import { Scenario } from '../../core/models/vertex/scenario';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { ScenarioService } from '../../core/services/scenario.service';

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.component.html',
  styleUrls: ['./groupes.component.less'],
})
export class GroupesComponent {

  groupPositions!:any[];

  PMA = [15, 15];
  PRV = [50, 10];
  CADI = [20, 50];

  editable: string[] = ['psy', 'implique'];
  keysGroup: string[] = ['UR', 'UA', 'EU', 'psy', 'implique'];
  displayedColumnsGroup: string[] = [
    'scene',
    'UR',
    'UA',
    'EU',
    'psy',
    'implique',
    'delete',
  ];
  dataSourceGroup!: Groupe[];

  @Input() scenario: Scenario;

  _groupes: Groupe[];

  get groupes(): Groupe[] {
    return this._groupes;
  }
  @Input() set groupes(value: Groupe[]) {
    if (value) {
      this._groupes = value;
      this.dataSourceGroup = value;
      this.initPosition(); 
    }
  }

  constructor(public dialog: MatDialog,private scenarioService:ScenarioService) {}

  addGroup() {
    let newGroupe = new Groupe({scene:(this.dataSourceGroup.length+1),scenario:this.scenario.id}); 

    this.scenarioService.createGroupe(newGroupe).subscribe(value=>{
      this.dataSourceGroup.push(newGroupe);
      console.log(this.dataSourceGroup);
      this.dataSourceGroup = [...this.dataSourceGroup];
    });
      


  }

  initPosition() {
    this.groupPositions = this.groupes.map(groupe => (
      [groupe.x,groupe.y,groupe.scene]
    ));

    this.groupPositions.push(this.PRV);
    this.groupPositions.push(this.PMA);
    this.groupPositions.push(this.CADI);
  }

  editGroup(id: number) {
    delete this.dataSourceGroup[id].scenario;
    delete this.dataSourceGroup[id].scene;

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

  updatePosition(event) {
    console.log('updatePosition');
    console.log(event);
  }
}
