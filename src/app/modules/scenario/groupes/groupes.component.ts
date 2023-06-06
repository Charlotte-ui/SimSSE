import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Groupe } from '../../../models/vertex/groupe';
import { MatDialog } from '@angular/material/dialog';
import { Scenario } from '../../../models/vertex/scenario';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { ScenarioService } from '../../../services/scenario.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { arrayEquals, roundingWithDecimal } from 'src/app/functions/tools';
import { Image } from 'src/app/services/image.service';

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.component.html',
  styleUrls: ['./groupes.component.less'],
})
export class GroupesComponent {
  form: FormGroup = this.fb.group({
    groupes: this.fb.array([]),
  });
  groupPositions!: any[];

  editable: string[] = ['psy', 'implique','t0'];
  keysGroup: string[] = ['UR', 'UA', 'EU', 'psy', 'implique','t0'];
  displayedColumnsGroup: string[] = [
    'scene',
    'UR',
    'UA',
    'EU',
    'psy',
    'implique',
    't0',
    'delete',
  ];

  @Input() scenario: Scenario;
  @Input() map: Image;


  _groupes: Groupe[];

  get groupes(): Groupe[] {
    return this._groupes;
  }
  @Input() set groupes(value: Groupe[]) {
    if (value) {
      this._groupes = value;
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
  @Output() updateScenario = new EventEmitter<Scenario>();

  constructor(
    public dialog: MatDialog,
    private scenarioService: ScenarioService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef   
  ) {}

  ngOnInit(): void {
    this.cdRef.detectChanges(); 
  }

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
    
    this.groupPositions.push(this.scenario.coordPRV);
    this.groupPositions.push(this.scenario.coordPMA);
    this.groupPositions.push(this.scenario.coordCADI);
 
  }

  editGroup(id: number) {
    delete this.groupes[id].scenario;
    delete this.groupes[id].scene;
  }

  getTotal(proprerty: string) {
    if (proprerty == 't0') return ''
    let res = 0;
    this.groupes.forEach((group) => {
      res += Number(group[proprerty]);
    });
    return res;
  }

  public deleteGroup(groupId: number) {
    let grpScene = this.groupes[groupId]['scene'];
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: ['Supprimer le groupe ' + grpScene, "Voulez-vous supprimer le groupe "+grpScene],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.scenarioService
          .removeGroupe(this.groupes[groupId],this.groupes[0])
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
    let updateScenario = false;
    let i = 0;
    this.groupes.forEach((groupe:Groupe,index:number) => {
      groupe.x = roundingWithDecimal(event[index][0],2)
      groupe.y = roundingWithDecimal(event[index][1],2)
      i = index;
    });
    i++;
    if (!arrayEquals(this.scenario.coordPRV,event[i])){
      this.scenario.coordPRV = event[i]
      updateScenario = true;
    }
    i++;
    if (!arrayEquals(this.scenario.coordPMA,event[i])){
      this.scenario.coordPMA = event[i]
      updateScenario = true;
    }
    i++;
    if (!arrayEquals(this.scenario.coordCADI,event[i])){
      this.scenario.coordCADI = event[i]
      updateScenario = true;
    }
    console.log("updatePosition ",this.scenario)

    if (updateScenario!) this.updateGroupes.emit(true)
    else this.updateScenario.emit(this.scenario)
    
  }

  private setForm() {
    const groupeCtrl = this.form.get('groupes') as FormArray;
    this.groupes.forEach((groupe: Groupe) => {
      let formGroupe = this.fb.group({
        implique: [groupe.implique],
        psy: [groupe.psy],
        t0: [groupe.t0],
      });
      groupeCtrl.push(formGroupe);
    });
  }
}
