import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Groupe } from '../../core/models/groupe';
import { Triage, Modele } from '../../core/models/modele';
import { Statut, Plastron } from '../../core/models/plastron';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeleService } from '../../core/services/modele.service';
import { ProfilService } from '../../core/services/profil.service';
import { RegleService } from '../../core/services/regle.service';
import { ScenarioService } from '../../core/services/scenario.service';
import { Scenario } from '../../core/models/scenario';
import { take } from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  group,
} from '@angular/animations';
import { Profil } from '../../core/models/profil';

interface tableElementPlastron {
  modele: string;
  triage: Triage;
  description: string;
  groupe: number;
  statut: Statut;
  id: number;
  idPlastron:string;
  numero: number;
  age: number;
  sexe: boolean;
}

@Component({
  selector: 'app-lot-plastrons',
  templateUrl: './lot-plastrons.component.html',
  styleUrls: ['./lot-plastrons.component.less'],
  animations: [
    trigger('descriptionExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ]),
  ],
})
export class LotPlastronsComponent {
  Modele = Modele;

  filterTags: string[] = [];
  allTags!: string[];
  defaultElementPlastron!: tableElementPlastron;
  displayedColumnsPlastron: string[] = [
    'id',
    'modele',
    'triage',
    'groupe',
    'statut',
    'description',
  ];
  dataSourcePlastron: Array<tableElementPlastron> = [];
  sortedDataSourcePlastron: Array<tableElementPlastron> = [];

  expandedElement!: tableElementPlastron | null;

  @Input() groupes!: Groupe[];

  _plastrons: Plastron[];
  get plastrons(): Plastron[] {
    return this._plastrons;
  }
  @Input() set plastrons(value: Plastron[]) {
    if (value) {
      // if value isnt undefined
      this._plastrons = value;
      this.completePlastrons();
    }
  }

  @Input() totalPlastron: number = 0;
  @Input() scenario: Scenario;

  @ViewChild('table', { static: true }) table: MatTable<tableElementPlastron>;
  @ViewChild(MatSort) sort: MatSort;

  @Output() newChange = new EventEmitter<boolean>();

  constructor(
    public scenarioService: ScenarioService,
    public modelService: ModeleService,
    public profilService: ProfilService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public regleService: RegleService,
    public modeleService: ModeleService,
  ) {
    this.defaultElementPlastron = new Object() as tableElementPlastron;
    this.defaultElementPlastron.description = '';
    this.defaultElementPlastron.groupe = undefined;
    this.defaultElementPlastron.modele = 'Associer ou créer un modèle';
    this.defaultElementPlastron.statut = Statut.Todo;
    this.defaultElementPlastron.triage = Triage.UR;
    this.defaultElementPlastron.id = -1;

    // let tab = Object.keys(this.defaultElementPlastron);

    //   type staffKeys = keyof tableElementPlastron; // "name" | "salary"

    this.regleService.getAllTagsPlastron().subscribe((response) => {
      this.allTags = response;
    });
  }

  drop(event: CdkDragDrop<string, any, any[]>) {
    console.log('drop');
    console.log(event);
    let index = event.currentIndex;
    let modele = event.previousContainer.data[event.previousIndex] as Modele;
    console.log(modele);

    if (this.dataSourcePlastron[index].triage == modele.triage) {
      this.dataSourcePlastron[index].modele = modele.title;
    } else {
      this._snackBar.open(
        'Attention, le modèle et le plastron doivent avoir le même triage',
        'Ok',
        {
          duration: 3000,
        }
      );
    }
  }

  sortData(sort: any) {
    const data = this.dataSourcePlastron.slice();
    sort = sort as Sort;

    console.log(sort);
    if (!sort.active || sort.direction === '') {
      this.sortedDataSourcePlastron = data;
      return;
    }

    this.sortedDataSourcePlastron = data.sort((a, b) => {
      console.log(a);
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.compare(Number(a.numero), Number(b.numero), isAsc);
        case 'modele':
          return this.compare(a.modele, b.modele, isAsc);
        case 'triage':
          return this.compare(a.triage, b.triage, isAsc);
        case 'groupe':
          return this.compare(a.groupe, b.groupe, isAsc);
        case 'statut':
          return this.compare(a.statut, b.statut, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    console.log('a: ' + a + ', b:' + b);
    console.log((a < b ? -1 : 1) * (isAsc ? 1 : -1));
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  goToPlastron(plastronId: string) {
    console.log(plastronId);
    this.router.navigate(['/plastron/' + plastronId]);
  }

  updateGroup(event, element: tableElementPlastron) {
    let plastron = this.plastrons[element.id];
    let newScene = event.value;
    let oldScene = plastron.groupe.scene;
    let newGroupe;

    this.groupes.forEach((groupe) => {
      if (groupe.scene == newScene) {
        groupe[element.triage]++;
        newGroupe = groupe;
      } else if (groupe.scene == oldScene) groupe[element.triage]--;
    });

    plastron.groupe = newGroupe;

    this.newChange.emit(true);
  }

  public completePlastrons() {
    console.log(this.plastrons);

    this.dataSourcePlastron = new Array<tableElementPlastron>(
      this.totalPlastron
    );
    this.dataSourcePlastron = new Array(this.totalPlastron)
      .fill(null)
      .map(() => ({ ...this.defaultElementPlastron }));

    this.plastrons.forEach((plastron, index) => {
      if (plastron.modele) this.addPlastronToDatasource(plastron, index);
      // une fois que tout les plastrons sont chargés, on update le triage des plastrons manquants
      if (index == this.plastrons.length - 1) this.updateDataSourceTriage(index)
    });

    //this.dataSourcePlastron = this.plastrons;
  }

  private addPlastronToDatasource(plastron: Plastron, index: number) {

    console.log("addPlastronToDatasource")
    
    //  this.dataSourcePlastron[index] = this.defaultElementPlastron;

    this.dataSourcePlastron[index].modele = plastron.modele.title;
    this.dataSourcePlastron[index].description = plastron.modele.description;
    this.dataSourcePlastron[index].triage = plastron.modele.triage;
    this.dataSourcePlastron[index].statut = Statut.Doing;
    this.dataSourcePlastron[index].id = index;
    this.dataSourcePlastron[index].idPlastron = plastron.id;
    this.dataSourcePlastron[index].groupe = plastron.groupe.scene;
    this.dataSourcePlastron[index].age = plastron.profil.age;
  }

  private updateDataSourceTriage(indexStart: number) {
    let UR = 0;
    let UA = 0;
    let EU = 0; // on compte le nombre de plastrons déjà réalisés dans chaque catégorie

    this.dataSourcePlastron.forEach((plastron, index) => {
      this.dataSourcePlastron[index].numero = index + 1;

      if (index <= indexStart) {
        // pour les plastrons déjà complétés, on compte
        switch (plastron.triage) {
          case 'UR':
            UR++;
            break;
          case 'UA':
            UA++;
            break;
          case 'EU':
            EU++;
            break;
        }
      } else {
        // sinon on modifie le triage des platrons à compléter
        if (UR < this.scenario.UR) UR++;
        else if (EU < this.scenario.EU) {
          EU++;
          plastron.triage = Triage.EU;
        } else plastron.triage = Triage.UA;
      }
    });

    this.sortedDataSourcePlastron = this.dataSourcePlastron.slice();
  }

  createModele(modele: Modele) {
    let newModele = this.modeleService.createNewModel(modele, true);
    this.router.navigate(['/modele/' + newModele.id]);
  }
}
