import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'src/app/functions/display';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.less'],
})
export class AccueilComponent {
  constructor(private router: Router) {}

  goTo(element: string) {
    this.router.navigate([`/${element}/`]);
  }

  getIcon(type:string) {
    return Button.getButtonByType(type)?.icon;
  }
}
