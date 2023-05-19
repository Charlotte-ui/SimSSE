import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Scenario } from '../../../models/vertex/scenario';
import { Button } from 'src/app/models/display';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
})
export class HeaderComponent implements OnInit {
  button = new Button();

  @Input() scenario: Scenario;
  @Input() plastron: string;
  @Input() modele: string;
  @Input() triage: string;
  @Input() changesToSave: boolean;

  @Output() newModele = new EventEmitter<boolean>();
  @Output() newSave = new EventEmitter<boolean>();
  @Output() newPDF = new EventEmitter<boolean>();

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToRules() {
    this.router.navigate(['/regles/']);
  }

  goToAccueil() {
    this.router.navigate(['/accueil/']);
  }

  goToScenario() {
    if (this.plastron) {
      // si plastron n'est pas initialisé, pas besoin de changer de page
      this.router.navigate(['/scenario/' + this.scenario.id]);
    }
  }

  saveAsNewModele() {
    this.newModele.emit(true);
  }

  save() {
    this.newSave.emit(true);
  }

  saveAsPDF() {
    this.newPDF.emit(true);
  }
}
