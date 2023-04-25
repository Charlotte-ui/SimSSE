import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plastron } from '../core/models/plastron';
import { ModeleService } from '../core/services/modele.service';
import { Model } from 'echarts';
import { Modele } from '../core/models/modele';
import { ProfilService } from '../core/services/profil.service';
import {  VariablePhysio, VariablePhysioInstance } from '../core/models/variablePhysio';
import { Link, Event, Trend, Graph } from '../core/models/node';
import { RegleService } from '../core/services/regle.service';
import { Profil } from '../core/models/profil';
import { PlastronService } from '../core/services/plastron.service';
import { Scenario } from '../core/models/scenario';

@Component({
  selector: 'app-plastron',
  templateUrl: './plastron.component.html',
  styleUrls: ['./plastron.component.less']
})
export class PlastronComponent implements OnInit {

  plastron!:Plastron;
  modele!:Modele;
  profil!:Profil;
  targetVariable!:VariablePhysioInstance[];
  scenario:Scenario;

  constructor(private route: ActivatedRoute,
              private modelService:ModeleService,
              private profilService:ProfilService,
              public regleService:RegleService,
              public plastronService:PlastronService) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (response) => {
        this.plastron = response['data'];

        this.modelService.getModeleById(this.plastron.modele).subscribe(
          (response) => {
            this.modele = response;
            this.initGragh();
          }
        );

        this.profilService.getProfilById(this.plastron.profil).subscribe(
          (response) => {
            this.profil = response;
            this.initTargetVariables();
          }
        );

        this.plastronService.getScenario(this.plastron).subscribe(
          (response) => {
            console.log("scenario")

            this.scenario = response;
            console.log(this.scenario)

          }
        );



      }
    );
  }

  initTargetVariables(){

    this.plastronService.getVariablesCibles(this.plastron).subscribe(
      (response) => {
        this.targetVariable = response;
      }
    );
  }

  initGragh(){
    this.modele["triggeredEvents"] = [[0,'start'],[50,'oxygénothérapie']]
    this.modele["graph"] = this.modelService.getGraph(); ; // TODO remove when back is finish
  }

  changeModeleRef(newModele){
    this.plastronService.changeModelRef(this.plastron,newModele);
  }

}


