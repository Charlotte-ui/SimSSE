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
import { Groupe } from '../../../models/vertex/groupe';
import { Triage, Modele } from '../../../models/vertex/modele';
import { Statut, Plastron } from '../../../models/vertex/plastron';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModeleService } from '../../../services/modele.service';
import { ProfilService } from '../../../services/profil.service';
import { RegleService } from '../../../services/regle.service';
import { ScenarioService } from '../../../services/scenario.service';
import { Scenario } from '../../../models/vertex/scenario';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { TagService } from '../../../services/tag.service';
import { Tag } from '../../../models/vertex/tag';
import { WaitComponent } from '../../shared/wait/wait.component';
import { PlastronService } from 'src/app/services/plastron.service';
import { Profil } from 'src/app/models/vertex/profil';
import { ConfirmDeleteDialogComponent } from '../../shared/confirm-delete-dialog/confirm-delete-dialog.component';

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
  variant: boolean;
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

  constructor(
    public scenarioService: ScenarioService,
    public modelService: ModeleService,
    public profilService: ProfilService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public regleService: RegleService,
    public modeleService: ModeleService,
    public tagSetvice: TagService,
    public plastronService: PlastronService
  ) {
    this.defaultElementPlastron = new Object() as tableElementPlastron;
    this.defaultElementPlastron.description = '';
    this.defaultElementPlastron.groupe = undefined;
    this.defaultElementPlastron.title = 'Associer un modèle';
    this.defaultElementPlastron.statut = Statut.Todo;
    this.defaultElementPlastron.triage = Triage.UR;
    this.defaultElementPlastron.id = -1;
    this.defaultElementPlastron.variant = false;

    this.tagSetvice.getAllTags('modele').subscribe((response) => {
      this.allTags = response;
    });
  }

  goToPlastron(plastronId: string) {
    this.router.navigate(['/plastron/' + plastronId]);
  }

  updateGroup(event, element: tableElementPlastron) {
    console.log("this.plastrons ",this.plastrons)
    console.log("element ",element)
    let plastron = this.getPlastronById(element.idPlastron);
    console.log("plastron ",plastron)

    let newScene = event.value;
    let oldScene = plastron.groupe.scene;
    let newGroupe;

    this.groupes.forEach((groupe) => {
      if (groupe.scene == newScene) {
        groupe[element.triage]++;
        newGroupe = groupe;
      } else if (groupe.scene == oldScene) groupe[element.triage]--;
    });


    this.plastronService.updatePlastronGroupe(plastron,newGroupe).subscribe(()=>{
          plastron.groupe = newGroupe;
    })
  }

    updateSelection(event,element: tableElementPlastron) {
    let plastron = this.plastrons[element.id];
    let newStatut = event.value;
    this.plastronService.updatePlastronStatut(plastron,newStatut).subscribe(()=>{
      plastron.statut = newStatut
    })
  }

  deletePlastron(event, element: tableElementPlastron) {
    console.log('event ', event);
    console.log('element ', element);

    console.log('id plastron ', element.idPlastron);
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: [
        'Supprimer le plastron ' + element.title,
        `Voulez-vous supprimer le plastron N° ${element.numero} ? Cela supprimera aussi le cas clinique associé à ce plastron s'il n'a pas été enregistré en tant que modèle.`,
      ],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialog.open(WaitComponent);
        this.plastronService
          .deletePlastron(this.getPlastronById(element.idPlastron))
          .subscribe(() => {
            this.dialog.closeAll();
            const indexSort = this.sortedDataSourcePlastron.indexOf(element, 0);
            let notAPlastron = structuredClone(this.defaultElementPlastron);
            this.dataSourcePlastron[element.id] = notAPlastron;
            this.sortedDataSourcePlastron[indexSort] = notAPlastron;
            this.sortedDataSourcePlastron = [...this.sortedDataSourcePlastron];
          });
      }
    });
  }

  public completePlastrons() {
    this.dataSourcePlastron = new Array<tableElementPlastron>(
      this.totalPlastron
    )
      .fill({ ...this.defaultElementPlastron })
      .map(() => ({ ...this.defaultElementPlastron }));

    // s'il n'y a encore aucun plastron dans le scenario
    if (this.plastrons.length == 0) this.updateDataSourceTriage(0);

    this.plastrons.forEach((plastron, index) => {
      if (plastron.modele) this.addPlastronToDatasource(plastron, index);
      plastron.groupe[plastron.modele.triage]++;
    });

    // une fois que tout les plastrons sont chargés, on update le triage des plastrons manquants
    this.updateDataSourceTriage(this.plastrons.length - 1);

    //this.dataSourcePlastron = this.plastrons;
  }

  private addPlastronToDatasource(plastron: Plastron, index: number) {
    this.dataSourcePlastron[index].title = plastron.modele.title;
    this.dataSourcePlastron[index].description = plastron.modele.description;
    this.dataSourcePlastron[index].triage = plastron.modele.triage;
    this.dataSourcePlastron[index].statut = plastron.statut;
    this.dataSourcePlastron[index].id = index;
    this.dataSourcePlastron[index].idPlastron = plastron.id;
    this.dataSourcePlastron[index].groupe = plastron.groupe?.scene;
    this.dataSourcePlastron[index].age = plastron.profil.age;
    this.dataSourcePlastron[index].variant =
      plastron.modele.template === true ? false : true;
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

  expandElement(event, element: tableElementPlastron) {
    this.expandedElement = this.expandedElement === element ? null : element;
    event.stopPropagation();
  }


    drop(event: CdkDragDrop<string, any, any[]>) {
    let index = event.currentIndex;

    // Get modele and plastron from drop event taking account of the filtered elements not showing in the arrays
    let data: Modele[] = event.previousContainer.data;
    let filteredData = data.filter(
      (element) => element['show'] || element['show'] === undefined
    );
    let modele = filteredData[event.previousIndex] as Modele;
    let currentPlastron = this.sortedDataSourcePlastron[index];
    let datasourceIndex = this.dataSourcePlastron.indexOf(currentPlastron);
    let filteredDataSource = this.dataSourcePlastron.filter(
      (element) => element.id !== -1
    );
    let realIndex = filteredDataSource.indexOf(currentPlastron);

    if (this.sortedDataSourcePlastron[index].triage == modele.triage) {
      // si le plastron n'existe pas encore
      if (this.sortedDataSourcePlastron[index].id === -1) {
        let newPlastron = new Plastron({ statut: Statut.Doing });
        let defaultGroupe = this.groupes[0];
        this.plastronService
          .createPlastron(newPlastron, defaultGroupe.id, modele.id)
          .subscribe((response: [string, Profil]) => {
            newPlastron.id = response[0];
            newPlastron.modele = modele;
            newPlastron.profil = response[1];
            newPlastron.groupe = defaultGroupe;
            this.plastrons.push(newPlastron);
            this.addPlastronToDatasource(newPlastron, datasourceIndex);
            this.groupes[0][newPlastron.modele.triage]++;
          });
      } else {
        this.plastronService
          .assignNewModel(this.plastrons[realIndex], modele.id)
          .subscribe(() => {
            this.plastrons[realIndex].modele = modele;
            this.addPlastronToDatasource(
              this.plastrons[realIndex],
              datasourceIndex
            );
          });
      }
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

  getPlastronById(idPlastron: string): Plastron {
    let res: Plastron;

    this.plastrons.forEach((plastron) => {
      if (plastron.id == idPlastron) res = plastron;
    });

    return res;
  }
}
