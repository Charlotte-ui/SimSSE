import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plastron } from '../core/models/plastron';
import { ModeleService } from '../core/services/modele.service';
import { Model } from 'echarts';
import { Modele } from '../core/models/modele';
import { ProfilService } from '../core/services/profil.service';
import {  VariablePhysio } from '../core/models/variablePhysio';
import { Link, Event, Trend } from '../core/models/node';
import { RegleService } from '../core/services/regle.service';
import { Profil } from '../core/models/profil';
import { PlastronService } from '../core/services/plastron.service';

@Component({
  selector: 'app-plastron',
  templateUrl: './plastron.component.html',
  styleUrls: ['./plastron.component.less']
})
export class PlastronComponent implements OnInit {

  plastron!:Plastron;
  modele!:Modele;
  profil!:Profil;
  targetVariable!:VariablePhysio[];
  data:(Event|Trend)[];
  links:Link[];

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

      }
    );
  }

  initTargetVariables(){

    this.regleService.getVariables().subscribe(
      (response) => {
        this.targetVariable = response;
      }
    );
  }

  initGragh(){
    let graph = this.modelService.getGraph(this.modele);
    this.data = graph[0] as (Event | Trend)[]
    this.links  = graph[1] as Link[]
  }

  changeModeleRef(newModele){
    this.plastronService.changeModelRef(this.plastron,newModele);
  }

}


