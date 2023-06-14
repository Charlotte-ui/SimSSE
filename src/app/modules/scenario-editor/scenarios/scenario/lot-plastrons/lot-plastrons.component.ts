import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatTableDataSourcePaginator,
} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { PlastronService } from 'src/app/services/plastron.service';
import { Profil } from 'src/app/models/vertex/profil';
import { getElementByChamp } from 'src/app/functions/tools';
import { Button } from 'src/app/functions/display';
import { Groupe } from 'src/app/models/vertex/groupe';
import { Triage, Modele } from 'src/app/models/vertex/modele';
import { Statut, Plastron } from 'src/app/models/vertex/plastron';
import { Scenario } from 'src/app/models/vertex/scenario';
import { Tag } from 'src/app/models/vertex/tag';
import { ConfirmDeleteDialogComponent } from 'src/app/modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { WaitComponent } from 'src/app/modules/shared/wait/wait.component';
import { ModeleService } from 'src/app/services/modele.service';
import { ProfilService } from 'src/app/services/profil.service';
import { RegleService } from 'src/app/services/regle.service';
import { ScenarioService } from 'src/app/services/scenario.service';
import { TagService } from 'src/app/services/tag.service';

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

  Button = Button;

  /**
   * plastron on mouseup
   */
  currentPlastron!: tableElementPlastron;

  sortedDataSourcePlastron!: MatTableDataSource<
    tableElementPlastron,
    MatTableDataSourcePaginator
  >;
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
  _totalPlastron: number;
  get totalPlastron(): number {
    return this._totalPlastron;
  }

  @Input() set totalPlastron(value: number) {
    if (value) {
      console.log('totalPlastron ', value);
      this._totalPlastron = value;
      this.sortedDataSourcePlastron =
        new MatTableDataSource<tableElementPlastron>(
          new Array<tableElementPlastron>(this.totalPlastron)
            .fill({ ...this.defaultElementPlastron })
            .map(() => ({ ...this.defaultElementPlastron }))
        );
      if (this.plastrons?.length > 0) this.completePlastrons();
      else this.updateDataSourceTriage(0);
    }
  }
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
    this.defaultElementPlastron.title =
      'Faites glisser un modèle traumato-physiopathologique';
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

  /**
   * on change group plastron attribution, update the database
   * @param event 
   * @param element 
   */
  updateGroup(event, element: tableElementPlastron) {
    let plastron = getElementByChamp(this.plastrons, 'id', element.idPlastron);
    let newScene = event.value;
    let oldScene = plastron.groupe.scene;
    let newGroupe;

    this.groupes.forEach((groupe) => {
      if (groupe.scene == newScene) {
        groupe[element.triage]++;
        newGroupe = groupe;
      } else if (groupe.scene == oldScene) groupe[element.triage]--;
    });

    this.plastronService
      .updatePlastronGroupe(plastron, newGroupe)
      .subscribe(() => {
        plastron.groupe = newGroupe;
      });
  }

  /**
   * on change plastron statut, update database
   * @param event 
   * @param element 
   */
  updateStatut(event, element: tableElementPlastron) {
    let plastron = this.plastrons[element.id];
    let newStatut = event.value;
    this.plastronService
      .updatePlastronStatut(plastron, newStatut)
      .subscribe(() => {
        plastron.statut = newStatut;
      });
  }

  deletePlastron(event, element: tableElementPlastron) {
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
          .deletePlastron(
            getElementByChamp(this.plastrons, 'id', element.idPlastron)
          )
          .subscribe(() => {
            this.dialog.closeAll();
            const indexSort = this.sortedDataSourcePlastron.data.indexOf(
              element,
              0
            );
            let notAPlastron = structuredClone(this.defaultElementPlastron);
            notAPlastron.triage = element.triage;
            //   this.dataSourcePlastron.data[element.id] = notAPlastron;
            this.sortedDataSourcePlastron.data[indexSort] = notAPlastron;
            this.sortedDataSourcePlastron.data = [
              ...this.sortedDataSourcePlastron.data,
            ];
          });
      }
    });
  }

  public completePlastrons() {
    // s'il n'y a encore aucun plastron dans le scenario
    if (this.plastrons.length == 0) this.updateDataSourceTriage(0);

    this.plastrons.forEach((plastron, index) => {
      console.log()
      if(plastron.modele.id){
        this.addPlastronToDatasource(plastron, index);
        plastron.groupe[plastron.modele.triage]++;
      }
      else{
//TODO delete all plastron that have no modele
      }

    });

    // une fois que tout les plastrons sont chargés, on update le triage des plastrons manquants
    this.updateDataSourceTriage(this.plastrons.length - 1);
  }

  private addPlastronToDatasource(plastron: Plastron, index: number) {
    this.sortedDataSourcePlastron.data[index].title = plastron.modele.title;
    this.sortedDataSourcePlastron.data[index].description =
      plastron.modele.description;
    this.sortedDataSourcePlastron.data[index].triage = plastron.modele.triage;
    this.sortedDataSourcePlastron.data[index].statut = plastron.statut;
    this.sortedDataSourcePlastron.data[index].id = index;
    this.sortedDataSourcePlastron.data[index].idPlastron = plastron.id;
    this.sortedDataSourcePlastron.data[index].groupe = plastron.groupe?.scene;
    this.sortedDataSourcePlastron.data[index].age = plastron.profil.age;
    this.sortedDataSourcePlastron.data[index].variant =
      plastron.modele.template === true ? false : true;
  }

  private updateDataSourceTriage(indexStart: number) {
    let UR = 0;
    let UA = 0;
    let EU = 0; // on compte le nombre de plastrons déjà réalisés dans chaque catégorie

    this.sortedDataSourcePlastron.data.forEach((plastron, index) => {
      this.sortedDataSourcePlastron.data[index].numero = index + 1;
      if (index <= indexStart) {
        // pour les plastrons déjà complétés, on compte
        switch (plastron.triage) {
          case Triage.UR:
            UR++;
            break;
          case Triage.UA:
            UA++;
            break;
          case Triage.EU:
            EU++;
            break;
        }
      } else {
        // sinon on modifie le triage des platrons à compléter
        if (UR < this.scenario.UR) {
          UR++;
          plastron.triage = Triage.UR;
        } else if (EU < this.scenario.EU) {
          EU++;
          plastron.triage = Triage.EU;
        } else plastron.triage = Triage.UA;
      }
    });

    this.sortedDataSourcePlastron =
      new MatTableDataSource<tableElementPlastron>(
        this.sortedDataSourcePlastron.data
      );
  }

  expandElement(event, element: tableElementPlastron) {
    this.expandedElement = this.expandedElement === element ? null : element;
    event.stopPropagation();
  }

  /**
   * EVENTS
   */

  /**
   * drop event, when the modele is put in the plastron table
   * @param event
   */
  drop(event: CdkDragDrop<string, any, any[]>) {
    let index = event.currentIndex;
    let items: tableElementPlastron[] = Array.from(
      event.container['_unsortedItems']
    ).map((value: any) => value.data as tableElementPlastron);

    console.log('event ', event);

    console.log('items ', items);

    // Get modele and plastron from drop event taking account of the filtered elements not showing in the arrays
    let data: Modele[] = event.previousContainer.data;
    let filteredData = data.filter(
      (element) => element['show'] || element['show'] === undefined
    );
    let modele = filteredData[event.previousIndex] as Modele;

    let currentPlastron;
    if (this.currentPlastron) currentPlastron = this.currentPlastron;
    else currentPlastron = this.sortedDataSourcePlastron.data[index];
    let datasourceIndex =
      this.sortedDataSourcePlastron.data.indexOf(currentPlastron);
    let filteredDataSource = this.sortedDataSourcePlastron.data.filter(
      (element) => element.id !== -1
    );

    let realIndex = filteredDataSource.indexOf(currentPlastron);

    console.log('modele ', modele);

    console.log('currentPlastron ', currentPlastron);

    if (
      this.sortedDataSourcePlastron.data[datasourceIndex].triage ==
      modele.triage
    ) {
      // si le plastron n'existe pas encore
      if (this.sortedDataSourcePlastron.data[datasourceIndex].id === -1) {
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

  /**
   * sort the plastron array
   * @param sort
   * @returns
   */
  sortData(sort: Sort) {
    if (sort.active && sort.direction !== '') {
      this.sortedDataSourcePlastron.data =
        this.sortedDataSourcePlastron.data.sort((a, b) => {
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
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  mouseup(plastron: tableElementPlastron) {
    console.log('mouseup  ', plastron);
    this.currentPlastron = plastron;
  }

  mouseleave() {
    this.currentPlastron = undefined;
  }
}
