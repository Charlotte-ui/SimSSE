import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plastron } from '../core/models/plastron';
import { ModeleService } from '../core/services/modele.service';
import { Model } from 'echarts';
import { Modele } from '../core/models/modele';
import { ProfilService } from '../core/services/profil.service';
import { TypeVariable, VariablePhysio } from '../core/models/variablePhysio';
import { Link, Event, Trend } from '../core/models/node';

@Component({
  selector: 'app-plastron',
  templateUrl: './plastron.component.html',
  styleUrls: ['./plastron.component.less']
})
export class PlastronComponent implements OnInit {

  plastron!:Plastron;
  modele!:Modele;
  profil!:any;
  targetVariable!:VariablePhysio[];
  data:(Event|Trend)[];
  links:Link[];

  constructor(private route: ActivatedRoute, private modelService:ModeleService, private profilService:ProfilService) { }

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
    let SpO2:VariablePhysio = {
      id:"0",
      type:TypeVariable.SpO2,
      cible:98,
      rand:1
    }
  
    let FR:VariablePhysio = {
      id:"1",
      type:TypeVariable.FR,
      cible:16,
      rand:1
    }

    this.targetVariable = [SpO2,FR];


  }

  initGragh(){
    let trend1:Trend = {
      id:"1",
      name: 'chute sat',
      x: 300,
      y: 300,
      type:'trend',
      cible:'SpO2',
      pente:-1
    }
    
    let trend2:Trend = {
      id:"2",
      name: 'acc respi',
      x: 500,
      y: 100,
      type:'trend',
      cible:'FR',
      pente:1
    }
    let event:Event = {
      id:"3",
      name: 'Oxygéno.',
      x: 550,
      y: 100,
      type:'event',
      event:'oxygénothérapie'
    }
    
    let start:Event = {
      id:"0",
      name: 'Start',
      x: 0,
      y: 0,
      type:'event',
      event:'start'
    }
    
    let link1:Link = {
      id:"0",
      source: 3,
      target: 1,
      type:"link",
      start:false
    }
    
    let link2:Link = {
      id:"1",
      source: 3,
      target: 2,
      type:"link",
      start:false
    }
    
    let link3:Link = {
      id:"2",
      source: 0,
      target: 1,
      type:"link",
      start:true
    }
    
    let link4:Link = {
      id:"3",
      source: 0,
      target: 2,
      type:"link",
      start:true
    }

    this.data = [start,trend1,trend2,event]
    this.links=[link1,link2,link3,link4]



  }

}


