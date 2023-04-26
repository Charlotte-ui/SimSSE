import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { Plastron, Statut } from '../core/models/plastron';
import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';
import { take } from 'rxjs';
import { ModeleService } from '../core/services/modele.service';
import { Modele, Triage } from '../core/models/modele';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../core/confirm-delete-dialog/confirm-delete-dialog.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProfilService } from '../core/services/profil.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegleService } from '../core/services/regle.service';

interface tableElementPlastron {
  modele: string;
  triage: Triage;
  description: string;
  groupe: number;
  statut: Statut;
  id: string;
  numero: number;
  age: number;
  sexe: boolean;
}

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less'],
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
export class ScenarioComponent implements OnInit {
  scenario!: Scenario;
  groupes!: Groupe[];
  plastrons!: Plastron[];
  totalPlastron: number = 0;

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

  filterTags: string[] = [];
  allTags!:string[];

  @ViewChild('table', { static: true }) table: MatTable<tableElementPlastron>;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private form: FormBuilder,
    public scenarioService: ScenarioService,
    public modelService: ModeleService,
    public profilService: ProfilService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public regleService:RegleService,
  ) {
    this.defaultElementPlastron = new Object() as tableElementPlastron;
    this.defaultElementPlastron.description = '';
    this.defaultElementPlastron.groupe = 1;
    this.defaultElementPlastron.modele = 'Associer ou créer un modèle';
    this.defaultElementPlastron.statut = Statut.Todo;
    this.defaultElementPlastron.triage = Triage.UR;
    // let tab = Object.keys(this.defaultElementPlastron);

    //   type staffKeys = keyof tableElementPlastron; // "name" | "salary"

     this.regleService.getAllTagsScenario().subscribe((response) => {
        this.allTags = response;
      });
  }

  ngOnInit(): void {
    this.route.data.subscribe((response) => {
      this.scenario = response['data'];

      this.scenarioService
        .getScenarioGroupes(this.scenario.id)
        .subscribe((response) => {
          this.groupes = response;
          this.plastrons = [];
          this.groupes.forEach((groupe, index) => {
            this.initialisePlastron(groupe);
          });
        });
    });
  }

  ngAfterViewInit() {
    // this.dataSourcePlastron.sort = this.sort;
  }

  private initialisePlastron(groupe) {
    console.log('initialisePlastron');
    console.log(groupe);
    this.scenarioService
      .getGroupePlastrons(groupe.id)
      .pipe(take(1))
      .subscribe((response) => {
        console.log(response);
        this.plastrons = this.plastrons.concat(response);
        this.completePlastrons();
      });
  }

  goToPlastron(plastronId: string) {
    console.log(plastronId);
    this.router.navigate(['/plastron/' + plastronId]);
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
      this.addPlastronToDatasource(plastron, index);
    });

    //this.dataSourcePlastron = this.plastrons;
  }

  private addPlastronToDatasource(plastron: Plastron, index: number) {
    //  this.dataSourcePlastron[index] = this.defaultElementPlastron;
    console.log(this.dataSourcePlastron);

    // on compte le nombre de plastrons par groupes
    this.groupes.forEach(groupe => {
      //groupe.
      
    });

    this.modelService.getModeleById(plastron.modele).subscribe((response) => {
      console.log(response);
      this.dataSourcePlastron[index].modele = response.title;
      this.dataSourcePlastron[index].description = response.description;
      this.dataSourcePlastron[index].triage = response.triage;
      this.dataSourcePlastron[index].statut = Statut.Doing;
      this.dataSourcePlastron[index].id = plastron.id;
      // une fois que tout les plastrons sont chargés, on update le triage des plastrons manquants
      if (index == this.plastrons.length - 1)
        this.updateDataSourceTriage(index);
    });

    this.profilService.getProfilById(plastron.profil).subscribe((response) => {
      console.log(response);
      this.dataSourcePlastron[index].age = response.age;
      this.dataSourcePlastron[index].sexe = response.sexe;
    });
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

  updateGroup(event,plastron:Plastron){

    // TODO

  }

  drop(event: CdkDragDrop<string, any, any[]>) {
    console.log('drop');
    console.log(event);
    let index = event.currentIndex;
    let modele = event.previousContainer.data[event.previousIndex] as Modele;
    console.log(modele);

    if (this.dataSourcePlastron[index].triage == modele.triage){
      this.dataSourcePlastron[index].modele = modele.title;
    }
    else {
      this._snackBar.open(
        'Attention, le modèle et le plastron doivent avoir le même triage',
        'Ok',
        {
          duration: 3000,
        }
      );

    }
    

    //const previousIndex = this.dataSource.findIndex((d) => d === event.item.data);

    //moveItemInArray(this.dataSource, previousIndex, event.currentIndex);
    //this.table.renderRows();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    /*     this.dataSourcePlastron.filter = filterValue.trim().toLowerCase();

    if (this.dataSourcePlastron.paginator) {
      this.dataSourcePlastron.paginator.firstPage();
    } */
  }

  public onSubmit() {
    //this.scenarioService.setScenario(this.scenarioFormGroup);
  }

  /** Announce the change in sort state for assistive technology. */
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
}
