import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Groupe } from '../../../models/vertex/groupe';
import { MatDialog } from '@angular/material/dialog';
import { Scenario } from '../../../models/vertex/scenario';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { ScenarioService } from '../../../services/scenario.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.component.html',
  styleUrls: ['./groupes.component.less'],
})
export class GroupesComponent {
  form: FormGroup;
  groupPositions!: any[];

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

  @Input() scenario: Scenario;

  _groupes: Groupe[];

  get groupes(): Groupe[] {
    return this._groupes;
  }
  @Input() set groupes(value: Groupe[]) {
    if (value) {
      this._groupes = value;
      this.form = this.fb.group({
        groupes: this.fb.array([]),
      });
      this.setForm();
      this.form.get('groupes').valueChanges.subscribe((groupes: Groupe[]) => {
        groupes.forEach((groupe: Groupe, index: number) => {
          if (this.groupes[index]) {
            this.groupes[index].implique = groupe.implique;
            this.groupes[index].psy = groupe.psy;
          }
        });

        this.updateGroupes.emit(true);
      });

      this.initPosition();
    }
  }

  @Output() updateGroupes = new EventEmitter<boolean>();

  constructor(
    public dialog: MatDialog,
    private scenarioService: ScenarioService,
    private fb: FormBuilder
  ) {}

  addGroup() {
    let newGroupe = new Groupe({
      scene: this.groupes.length + 1,
      scenario: this.scenario.id,
    });

    this.scenarioService.createGroupe(newGroupe).subscribe((value) => {
      newGroupe['@rid'] = value;
      this.groupes.push(new Groupe(newGroupe));
      this.groupes = [...this.groupes];
      this.setForm();
    });
  }

  initPosition() {
    this.groupPositions = this.groupes.map((groupe) => [
      groupe.x,
      groupe.y,
      groupe.scene,
    ]);

    this.groupPositions.push(this.PRV);
    this.groupPositions.push(this.PMA);
    this.groupPositions.push(this.CADI);
/*  TODO replace when change in bdd
    this.groupPositions.push([this.scenario.PRVx,this.scenario.PRVy]);
    this.groupPositions.push([this.scenario.PMAx,this.scenario.PMAy]);
    this.groupPositions.push([this.scenario.CADIx,this.scenario.CADIy]);
 */
  }

  editGroup(id: number) {
    delete this.groupes[id].scenario;
    delete this.groupes[id].scene;
  }

  getTotal(proprerty: string) {
    let res = 0;
    this.groupes.forEach((group) => {
      res += Number(group[proprerty]);
    });
    return res;
  }

  public deleteGroup(groupId: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: 'groupe ' + this.groupes[groupId]['scene'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result) {
        this.scenarioService
          .deleteGroupe(this.groupes[groupId])
          .subscribe(() => {
            this.groupes.splice(groupId, 1);

            this.groupes = [...this.groupes];
          });
      }
    });
  }

  public isEditable(champ: string) {
    if (this.editable.includes(champ)) return true;
    return false;
  }

  updatePosition(event:any[]) {
    console.log('updatePosition');
    console.log(event);
    let i = 0;
    this.groupes.forEach((groupe:Groupe,index:number) => {
      groupe.x = Math.round(event[index][0])
      groupe.y = Math.round(event[index][1])
      i = index;
    });
    i++;
    this.scenario.PRVx = event[i][0]
    this.scenario.PRVy = event[i][1]
    i++;
    this.scenario.PMAx = event[i][0]
    this.scenario.PMAy = event[i][1]
    i++;
    this.scenario.CADIx = event[i][0]
    this.scenario.CADIy = event[i][1]

    this.updateGroupes.emit(true)
  }

  private setForm() {
    const groupeCtrl = this.form.get('groupes') as FormArray;
    this.groupes.forEach((groupe: Groupe) => {
      let formGroupe = this.fb.group({
        implique: [groupe.implique],
        psy: [groupe.psy],
      });
      groupeCtrl.push(formGroupe);
    });
  }
}
