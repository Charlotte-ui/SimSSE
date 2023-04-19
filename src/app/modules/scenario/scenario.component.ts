import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder ,FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { Plastron, Statut } from '../core/models/plastron';
import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';
import { take } from 'rxjs';
import { ModeleService } from '../core/services/modele.service';
import { Modele, Triage } from '../core/models/modele';
import { MatDialog } from '@angular/material/dialog';
import { AddRegleDialogComponent } from '../regles/tab-regles/add-regle-dialog/add-regle-dialog.component';
import { ConfirmDeleteDialogComponent } from '../core/confirm-delete-dialog/confirm-delete-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { ProfilService } from '../core/services/profil.service';

interface tableElementPlastron{
  modele:string;
  triage:Triage;
  description:string;
  groupe:number;
  statut:Statut;
  id:number;
  age:number;
  sexe:boolean;
}

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
  animations:[
    trigger('descriptionExpand',[
      state('collapsed',style({height:'0px',minHeight:'0'})),
      state('expanded',style({height:'*'})),
      transition('expanded <=> collapsed',animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ])
  ]
})

export class ScenarioComponent implements OnInit {

  scenario!: Scenario ;
  groupes!: Groupe[];
  plastrons!: Plastron[];

  defaultElementPlastron!:tableElementPlastron;

  keysGroup: string[] = ['UR', 'UA', 'EU','psy','impliques'];
  displayedColumnsGroup: string[] = ['scene', 'UR', 'UA', 'EU','psy','impliques','edit','delete'];
  displayedColumnsPlastron: string[] = ['id','modele', 'triage', 'groupe','statut', 'description'];


  dataSourceGroup = [];
  dataSourcePlastron:Array<tableElementPlastron> = [];

  scenarioFormGroup;

  totalPlastron:number=0;
  totalParticipant:number=0;

  expandedElement!:tableElementPlastron|null;

  allTags =  ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  tags = ['Lemon', 'Lime' , 'Apple' ];

  @ViewChild('table', { static: true }) table: MatTable<tableElementPlastron>;

  constructor(private route: ActivatedRoute,
    private form: FormBuilder,
    public scenarioService:ScenarioService,
    public modelService:ModeleService,
    public profilService:ProfilService,
    private router: Router,
    public dialog: MatDialog) {

      this.defaultElementPlastron = new Object()  as tableElementPlastron;
      this.defaultElementPlastron.description = "";
      this.defaultElementPlastron.groupe = 1;
      this.defaultElementPlastron.modele = "Associer ou créer un modèle";
      this.defaultElementPlastron.statut = Statut.Todo;
      this.defaultElementPlastron.triage = Triage.UR;
     // let tab = Object.keys(this.defaultElementPlastron);

   //   type staffKeys = keyof tableElementPlastron; // "name" | "salary"


    }

  ngOnInit(): void {

    this.route.data.subscribe(
      (response) => {
        this.scenario = response['data'];
        this.scenarioFormGroup = this.form.group(this.scenario);

        this.totalPlastron = this.scenario.EU + this.scenario.UA + this.scenario.UR;
        this.totalParticipant = this.totalPlastron + this.scenario.impliques + this.scenario.psy;


        this.scenarioService.getScenarioGroupes(this.scenario.id).subscribe(
          (response) => {
            this.groupes = response;
            this.dataSourceGroup = this.groupes;

            this.plastrons = [];
            this.groupes.forEach((groupe, index) => {
              this.initialisePlastron(groupe)
            })


          }
        );
      }
    );



  }

  private initialisePlastron(groupe){
    console.log("initialisePlastron")
    console.log(groupe)
    this.scenarioService.getGroupePlastrons(groupe.id).pipe(take(1)).subscribe(
      (response) => {
        console.log(response)
        this.plastrons = this.plastrons.concat(response);
        this.completePlastrons();
      }
    );
  }

  public removeGroup(groupId:number){

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent,
      {data: "groupe "+this.dataSourceGroup[groupId]['scene']});

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result) this.dataSourceGroup.splice(groupId, 1);


      this.dataSourceGroup = [... this.dataSourceGroup]


    });
  }

  public onSubmit(){
    this.scenarioService.setScenario(this.scenarioFormGroup);
  }

  goToPlastron(plastronId:string){

    this.router.navigate(['/plastron/'+plastronId]);


  }

  public completePlastrons(){
    console.log(this.plastrons);

    this.dataSourcePlastron = new Array<tableElementPlastron>(this.totalPlastron);
    this.dataSourcePlastron = new Array(this.totalPlastron).fill(null).map(()=> ({...this.defaultElementPlastron}))


    this.plastrons.forEach((plastron, index) => {
      this.addPlastronToDatasource(plastron,index)
    })

    //this.dataSourcePlastron = this.plastrons;
  }

  private addPlastronToDatasource(plastron:Plastron,index:number){
  //  this.dataSourcePlastron[index] = this.defaultElementPlastron;
    console.log(this.dataSourcePlastron);

    this.modelService.getModeleById(plastron.modele).subscribe(
      (response) => {
        console.log(response)
        this.dataSourcePlastron[index].modele = response.titre;
        this.dataSourcePlastron[index].description = response.description;
        this.dataSourcePlastron[index].triage = response.triage;
        this.dataSourcePlastron[index].statut = Statut.Doing;
        // une fois que tout les plastrons sont chargés, on update le triage des plastrons manquants
        if(index == this.plastrons.length-1) this.updateDataSourceTriage(index)

      }
    );

    this.profilService.getProfilById(plastron.profil).subscribe(
      (response) => {
        console.log(response)
        this.dataSourcePlastron[index].age = response.age;
        this.dataSourcePlastron[index].sexe = response.sexe;
      }
    );

  }

  private updateDataSourceTriage(indexStart:number){
    let UR = 0;
    let UA = 0;
    let EU = 0; // on compte le nombre de plastrons déjà réalisés dans chaque catégorie

    this.dataSourcePlastron.forEach((plastron,index) => {
      this.dataSourcePlastron[index].id = index+1;

      if(index<=indexStart){ // pour les plastrons déjà complétés, on compte
        switch(plastron.triage){
          case 'UR': UR++;
          break
          case 'UA': UA++;
          break
          case 'EU': EU++;
          break
        }
      }
      else{ // sinon on modifie le triage des platrons à compléter
        if(UR<this.scenario.UR) UR++;
        else if(EU<this.scenario.EU){
          EU++;
          plastron.triage = Triage.EU
        }
        else plastron.triage = Triage.UA
      }





    });
  }


  addGroup(){
    let newGroup:Partial<Groupe> = {
      "impliques":0,
      "EU":0,
      "UA":0,
      "UR":0,
      "psy":0,
    }

    this.openDialog(newGroup,-1);

  }

  editGroup(id:number){

    delete this.dataSourceGroup[id].scenario;
    delete this.dataSourceGroup[id].scene;

    this.openDialog(this.dataSourceGroup[id],id);

  }

  openDialog(element:Partial<Groupe>,id:number){

    const dialogRef = this.dialog.open(AddRegleDialogComponent,
      {data: element});

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result == undefined) return;

      if(Number(id)>=0) {
        result["scene"]=id+1
        this.dataSourceGroup[Number(id)] = result; // TODO database add with scenario id
      }
      else {
        result["scene"]=this.dataSourceGroup.length+1
        result["scenario"]=this.scenario.id
        this.dataSourceGroup.push(result)
      }

      console.log(this.dataSourceGroup)

      this.dataSourceGroup = [... this.dataSourceGroup]


    });

  }

  getTotal(proprerty:string) {
    let res = 0 ;
    this.dataSourceGroup.forEach(group => {
      res+=Number(group[proprerty]);
    });
    return res;
  }

  drop(event: CdkDragDrop<string, any, any[]>) {
    console.log("drop");
    console.log(event)
    let index = event.currentIndex;
    let modele = event.previousContainer.data[event.previousIndex];
    console.log(modele)

   this.dataSourcePlastron[index].modele = modele.titre;

    //const previousIndex = this.dataSource.findIndex((d) => d === event.item.data);

    //moveItemInArray(this.dataSource, previousIndex, event.currentIndex);
    //this.table.renderRows();

  }



}
