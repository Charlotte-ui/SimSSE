import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
}
