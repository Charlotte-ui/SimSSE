import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Groupe } from '../../core/models/vertex/groupe';
import { MatDialog } from '@angular/material/dialog';
import { Scenario } from '../../core/models/vertex/scenario';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { ScenarioService } from '../../core/services/scenario.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.component.html',
  styleUrls: ['./groupes.component.less'],
})
export class GroupesComponent {
  form :FormGroup;
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
      this.form= this.fb.group({
        groupes: this.fb.array([])
    })
    this.setForm();
    this.form.get('groupes').valueChanges.subscribe((groupes:Groupe[]) => {

      groupes.forEach((groupe:Groupe,index:number) => {
        if(this.groupes[index]){
          this.groupes[index].implique = groupe.implique;
        this.groupes[index].psy = groupe.psy;
        }

      });
      
      console.log('groupes', groupes)


      this.updateGroupes.emit(true)
    });
    
/*     let formSource = {}
      value.forEach((groupe:Groupe) => {
        formSource[groupe.id+"_implique"]=groupe.implique;
        formSource[groupe.id+"_psy"]=groupe.psy;
      });

      this.form = this.fb.group(value.map((groupe:Groupe)=>
      {groupe.id+""})); */

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
      console.log("newGroupe ",newGroupe)
      console.log("value ",value)
      newGroupe['@rid']=value;
      this.groupes.push(new Groupe(newGroupe));
      console.log(this.groupes);
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

        this.scenarioService.deleteGroupe(this.groupes[groupId]).subscribe(()=>{
          this.groupes.splice(groupId, 1);

          this.groupes = [...this.groupes];
        })
      
      }
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

  private setForm(){
    const groupeCtrl = this.form.get('groupes') as FormArray;
    this.groupes.forEach((groupe:Groupe)=>{
      let formGroupe = this.fb.group({
        implique:[groupe.implique],
        psy:[groupe.psy],
    });
      groupeCtrl.push(formGroupe)
    })
  };


}
