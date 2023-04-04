import { Component, OnInit } from '@angular/core';
import { FormBuilder ,FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { Plastron, Statut } from '../core/models/plastron';
import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';
import { take } from 'rxjs';
import { ModeleService } from '../core/services/modele.service';
import { Triage } from '../core/models/modele';

interface tableElementPlastron{
  modele:string;
  triage:Triage;
  description:string;
  profil:string;
  groupe:number;
  statut:Statut;
  id:string;
}

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less']
})

export class ScenarioComponent implements OnInit {

  scenario!: Scenario ;
  groupes!: Groupe[];
  plastrons!: Plastron[];

  defaultElementPlastron!:tableElementPlastron;


  displayedColumnsGroup: string[] = ['scene', 'UR', 'UA', 'EU','delete'];
  displayedColumnsPlastron: string[] = ['modele', 'triage', 'description', 'profil','groupe','statut'];

  dataSourceGroup = [];
  dataSourcePlastron:Array<tableElementPlastron> = [];

  scenarioFormGroup;

  totalPlastron:number=0;


  constructor(private route: ActivatedRoute,
    private form: FormBuilder,
    public scenarioService:ScenarioService,
    public modelService:ModeleService,
    private router: Router) { 

      this.defaultElementPlastron = new Object()  as tableElementPlastron;
      this.defaultElementPlastron.description = "";
      this.defaultElementPlastron.groupe = 1;
      this.defaultElementPlastron.modele = "Associer ou créer un modèle";
      this.defaultElementPlastron.profil = "Créer un profil";
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
    
  
  public addGroup(){}
  public removeGroup(groupId:string){}

  public onSubmit(){

  }

  goToPlastron(plastronId:string){

    this.router.navigate(['/plastron/'+plastronId]);
   

  }
  
  public completePlastrons(){
    console.log(this.plastrons);

    this.dataSourcePlastron = new Array<tableElementPlastron>(50);
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
        this.dataSourcePlastron[index].id = plastron.id;

      }
    ); 

  }

}
