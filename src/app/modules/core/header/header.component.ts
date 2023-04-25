import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Scenario } from '../models/scenario';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  @Input() scenario: Scenario;
  @Input() plastron: string;
  @Input() triage: string;

  @Input() save: (args: any) => void;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToRules(){
    this.router.navigate(['/regles/']);
  }

  goToAccueil(){
    this.router.navigate(['/accueil/']);
  }

  goToScenario(){
    if (this.plastron){ // si plastron n'est pas initialisé, pas besoin de changer de page
      console.log(this.scenario)
      this.router.navigate(['/scenario/'+this.scenario.id]);
    }

  }

}
