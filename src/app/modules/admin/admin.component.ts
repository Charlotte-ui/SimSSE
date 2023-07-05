import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { concat, finalize, forkJoin, from, map, switchMap, zipAll } from 'rxjs';
import { getElementByChamp } from 'src/app/functions/tools';
import { Groupe } from 'src/app/models/vertex/groupe';
import { Modele } from 'src/app/models/vertex/modele';
import { EventType, Graph ,Event,Node} from 'src/app/models/vertex/node';
import { Plastron } from 'src/app/models/vertex/plastron';
import { Profil } from 'src/app/models/vertex/profil';
import { Scenario } from 'src/app/models/vertex/scenario';
import { ApiService } from 'src/app/services/api.service';
import { ModeleService } from 'src/app/services/modele.service';
import { NodeService } from 'src/app/services/node.service';
import { PlastronService } from 'src/app/services/plastron.service';
import { ProfilService } from 'src/app/services/profil.service';
import { RegleService } from 'src/app/services/regle.service';
import { ScenarioService } from 'src/app/services/scenario.service';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less'],
})
export class AdminComponent {
  plastrons: Plastron[];
  modelesPlastron: Map<string, Modele> = new Map<string, Modele>();
  profilsPlastron: Map<string, Profil> = new Map<string, Profil>();
  groupesPlastron: Map<string, Groupe> = new Map<string, Groupe>();

  groupes: Groupe[];
  scenarioGroupe: Map<string, Scenario> = new Map<string, Scenario>();

  modeles: Modele[];
  templatesModele: Map<string, Modele> = new Map<string, Modele>();
  graphsModele: Map<string, Graph> = new Map<string, Graph>();

  graphs: Graph[];
  startsGraph: Map<string, Event> = new Map<string, Event>();
  modelesGraph: Map<string, Modele> = new Map<string, Modele>();

  constructor(
    private modelService: ModeleService,
    public regleService: RegleService,
    public plastronService: PlastronService,
    public dialog: MatDialog,
    private scenarioService: ScenarioService,
    private tagService: TagService,
    private profilService: ProfilService,
    private nodeService: NodeService,
    private apiServie: ApiService
  ) {
    plastronService
      .getPlastrons()
      .pipe(
        switchMap((plastrons: Plastron[]) => {
          this.plastrons = plastrons;
          let requestsModele = plastrons.map((plastron: Plastron) =>
            plastronService.getPlastronModele(plastron.id).pipe(
              map((modele: Modele) => {
                this.modelesPlastron.set(plastron.id, modele);
              })
            )
          );

          let requestsProfil = plastrons.map((plastron: Plastron) =>
            plastronService.getPlastronProfil(plastron.id).pipe(
              map((profil: Profil) => {
                this.profilsPlastron.set(plastron.id, profil);
              })
            )
          );

          let requestsGroupe = plastrons.map((plastron: Plastron) =>
            plastronService.getPlastronGroupe(plastron.id).pipe(
              map((groupe: Groupe) => {
                this.groupesPlastron.set(plastron.id, groupe);
              })
            )
          );

          return forkJoin([
            concat(requestsModele).pipe(zipAll()),
            concat(requestsProfil).pipe(zipAll()),
            concat(requestsGroupe).pipe(zipAll()),
          ]);
        })
      )
      .subscribe();

    scenarioService
      .getGroupes()
      .pipe(
        switchMap((groupes: Groupe[]) => {
          this.groupes = groupes;
          let requestsScenario = groupes.map((groupe: Groupe) =>
            scenarioService.getGroupeScenario(groupe.id).pipe(
              map((scenario: Scenario) => {
                this.scenarioGroupe.set(groupe.id, scenario);
              })
            )
          );

          return concat(requestsScenario).pipe(zipAll());
        })
      )
      .subscribe();

      modelService
      .getModeles()
      .pipe(
        switchMap((modeles: Modele[]) => {
          this.modeles = modeles;
          let requestsTemplates = modeles.map((modele: Modele) =>
            modelService.getTemplateModele(modele.id).pipe(
              map((template: Modele) => {
                this.templatesModele.set(modele.id, template);
              })
            )
          );

          let requestsGraph = modeles.map((modele: Modele) =>
            modelService.getGraph(modele.id).pipe(
              map((graph: Graph) => {
                this.graphsModele.set(modele.id, graph);
              })
            )
          );



          return  forkJoin([
            concat(requestsGraph).pipe(zipAll()),
            concat(requestsTemplates).pipe(zipAll()),
          ]);
        })
      )
      .subscribe();

      
      nodeService
      .getGraphs()
      .pipe(
        switchMap((graphs: Graph[]) => {
          this.graphs = graphs;
          let requestsStart = graphs.map((graph: Graph) =>
            nodeService.getGraphNodes(graph.id).pipe(
              map((nodes: Node[]) => {
                this.startsGraph.set(graph.id, getElementByChamp<Node>(nodes,'event',EventType.start) as Event);
              })
            )
          );

          let requestsModele = graphs.map((graph: Graph) =>
            modelService.getModeleGraph(graph.id).pipe(
              map((modele: Modele) => {
                this.modelesGraph.set(graph.id, modele);
              })
            )
          );



          return  forkJoin([
            concat(requestsStart).pipe(zipAll()),
            concat(requestsModele).pipe(zipAll()),
          ]);
        })
      )
      .subscribe();
  }

  delete(id: string) {
    this.apiServie.deleteDocument(id).subscribe();
  }
}
