import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Scenario } from '../../../models/vertex/scenario';
import { Button } from 'src/app/functions/display';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Plastron } from 'src/app/models/vertex/plastron';
import { Modele } from 'src/app/models/vertex/modele';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
})
export class HeaderComponent implements OnInit {
  Button = Button;
  pseudo!: string;
  role!: string;
  editor: boolean = false;
  admin: boolean = false;
  animator: boolean = false;

  @Input() scenario: Scenario;
  @Input() plastron: Plastron;
  @Input() modele: Modele;
  @Input() changesToSave: boolean;

  @Output() newModele = new EventEmitter<boolean>();
  @Output() newSave = new EventEmitter<boolean>();
  @Output() newPDF = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.pseudo = localStorage.getItem('pseudo');
    this.role = '';
    if (localStorage.getItem('admin') == 'true') {
      this.role += 'admin ';
      this.admin = true;
    }
    if (localStorage.getItem('editor') == 'true') {
      this.role += 'editeur ';
      this.editor = true;
    }
    if (localStorage.getItem('animator') == 'true') {
      this.role += 'animateur ';
      this.animator = true;
    }
  }

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

  /**
   * go to the editor pages, tab scenarios
   */
  goToScenarios() {
    this.router.navigate(['/editeur']);
  }

  /**
   * go to the editor pages, tab modeles
   */
  goToModeles() {
    this.router.navigate(['/editeur'], {
      queryParams: {
        tab: 'modeles',
      },
      queryParamsHandling: 'merge',
    });
  }

  save() {
    this.newSave.emit(true);
  }

  saveAsPDF() {
    this.newPDF.emit(true);
  }

  logout() {
    this.authenticationService.logout();
  }

  getTooltip() {
    if (this.plastron)
      return 'Enregister le plastron ' + this.plastron.modele.title;
    if (this.scenario) return 'Enregister le scenario ' + this.scenario.title;
    if (this.modele) return 'Enregister le modèle ' + this.modele.title;
    return '';
  }

  getElementTitle() {
    if (this.plastron) return this.plastron.modele.title;
    if (this.scenario) return this.scenario.title;
    if (this.modele) return this.modele.title;
    return '';
  }

  getTriage() {
    if (this.plastron) return this.plastron.modele.triage;
    if (this.modele) return this.modele.triage;
    return '';
  }

  goTo(element: string) {
    this.router.navigate([`/${element}/`]);
  }
}
