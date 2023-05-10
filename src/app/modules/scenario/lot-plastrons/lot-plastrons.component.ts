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
import { Groupe } from '../../core/models/vertex/groupe';
import { Triage, Modele } from '../../core/models/vertex/modele';
import { Statut, Plastron } from '../../core/models/vertex/plastron';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModeleService } from '../../core/services/modele.service';
import { ProfilService } from '../../core/services/profil.service';
import { RegleService } from '../../core/services/regle.service';
import { ScenarioService } from '../../core/services/scenario.service';
import { Scenario } from '../../core/models/vertex/scenario';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { TagService } from '../../core/services/tag.service';
import { Tag } from '../../core/models/vertex/tag';
import { WaitComponent } from '../../shared/wait/wait.component';

interface tableElementPlastron {
  title: string;
  triage: Triage;
  description: string;
  groupe: number;
  statut: Statut;
  id: number;
  idPlastron: string;
  numero: number;
  age: number;
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
  filterTags: Tag[] = [];
  allTags!: Tag[];
  defaultElementPlastron!: tableElementPlastron;
  displayedColumnsPlastron: string[] = [
    'id',
    'title',
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
      this._plastrons = value;
      this.completePlastrons();
    }
  }

  /**
   * nombre total de plastron désiré pour ce scenario
   */
  @Input() totalPlastron!: number;
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
    public tagSetvice: TagService
  ) {
    this.defaultElementPlastron = new Object() as tableElementPlastron;
    this.defaultElementPlastron.description = '';
    this.defaultElementPlastron.groupe = undefined;
    this.defaultElementPlastron.title = 'Associer un modèle';
    this.defaultElementPlastron.statut = Statut.Todo;
    this.defaultElementPlastron.triage = Triage.UR;
    this.defaultElementPlastron.id = -1;

    this.tagSetvice.getAllTags('modele').subscribe((response) => {
      this.allTags = response;
    });
  }

  drop(event: CdkDragDrop<string, any, any[]>) {
    let index = event.currentIndex;
    let modele = event.previousContainer.data[event.previousIndex] as Modele;
    if (this.dataSourcePlastron[index].triage == modele.triage) {
      this.dataSourcePlastron[index].title = modele.title;
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

    if (!sort.active || sort.direction === '') {
      this.sortedDataSourcePlastron = data;
      return;
    }

    this.sortedDataSourcePlastron = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.compare(Number(a.numero), Number(b.numero), isAsc);
        case 'title':
          return this.compare(a.title, b.title, isAsc);
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
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  goToPlastron(plastronId: string) {
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
    console.log('this.totalPlastron');
    console.log(this.totalPlastron);
    this.dataSourcePlastron = new Array<tableElementPlastron>(
      this.totalPlastron
    )
      .fill({ ...this.defaultElementPlastron })
      .map(() => ({ ...this.defaultElementPlastron }));

    // s'il n'y a encore aucun plastron dans le scenario
    if (this.plastrons.length == 0) this.updateDataSourceTriage(0);

    this.plastrons.forEach((plastron, index) => {
      if (plastron.modele) this.addPlastronToDatasource(plastron, index);
      // une fois que tout les plastrons sont chargés, on update le triage des plastrons manquants
      if (index == this.plastrons.length - 1)
        this.updateDataSourceTriage(index);
    });

    //this.dataSourcePlastron = this.plastrons;
  }

  private addPlastronToDatasource(plastron: Plastron, index: number) {
    //  this.dataSourcePlastron[index] = this.defaultElementPlastron;
    this.dataSourcePlastron[index].title = plastron.modele.title;
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
    this.dialog.open(WaitComponent);

    this.modeleService.createModele(modele, true).subscribe((id) => {
      this.router.navigate(['/modele/' + id]);

      this.dialog.closeAll();
    });
  }

  expandElement(event, element: tableElementPlastron) {
    this.expandedElement = this.expandedElement === element ? null : element;
    event.stopPropagation();
  }
}
