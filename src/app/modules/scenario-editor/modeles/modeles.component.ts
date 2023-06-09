import { Component } from '@angular/core';
import { Modele } from 'src/app/models/vertex/modele';
import { ModeleService } from 'src/app/services/modele.service';

@Component({
  selector: 'app-modeles',
  templateUrl: './modeles.component.html',
  styleUrls: ['./modeles.component.less']
})
export class ModelesComponent {
  Modele = Modele;

  constructor(
    public modeleService: ModeleService,
  ) {}
}
