import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { Scenario } from '../core/models/plastron';

import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less']
})
export class ScenarioComponent implements OnInit {

  scenario!: Scenario ;
  groupes!: Groupe[];
  plastrons! Plastron[];

  displayedColumnsGroup: string[] = ['scene', 'UR', 'UA', 'EU'];
  displayedColumnsPlastron: string[] = ['modele', 'triage', 'description', 'profil','groupe','statut'];

  dataSourceGroup = groupes;
  dataSourcePlastron = plastrons;

  scenarioFormGroup = this.form.group(this.scenario);


  constructor(private route: ActivatedRoute,private form: FormBuilder,public scenarioService:ScenarioService) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (response) => {
        this.scenario = response['data'];
        
         this.scenarioFormGroup = this.form.group(this.scenario);

        this.scenarioService.getScenarioGroupes(this.scenario.id).subscribe(
          (response) => {
            this.groupes = response['data'];
            this.dataSourceGroup = this.groupes;
            
            this.plastrons = [];
            
            this.groupes.forEach(function(groupe){
                   
              this.scenarioService.getGroupePlastrons(groupe.id).subscribe(
                (response) => {
                  this.plastrons = this.plastrons.concat(response['data']);
                }
              );
              
            }
                                 
            this.completePlastrons();
                                 
                                 
            });
          }
        );

      },
      (error:any) => {
        console.log(error);
      }
    );
  }
  
  
  public addGroup(){}
  public deleteGroup(){}
  
  public completePlastrons(){
    this.dataSourcePlastron = this.plastrons;
  }

}
