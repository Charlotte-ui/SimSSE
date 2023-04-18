import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  @Input() scenario: string;
  @Input() plastron: string;


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

  }

}
