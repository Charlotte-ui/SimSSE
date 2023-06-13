import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ConnexionComponent } from './modules/connexion/connexion.component';
import { AuthGuard } from './helpers/auth.guard';
import { PlastronComponent } from './modules/plastron/plastron.component';
import { PlastronResolver } from './modules/plastron/plastron.resolver';
import { ReglesComponent } from './modules/regles/regles.component';
import { ScenarioEditorComponent } from './modules/scenario-editor/scenario-editor.component';
import { ModeleComponent } from './modules/scenario-editor/modeles/modele/modele.component';
import { ModeleResolver } from './modules/scenario-editor/modeles/modele/modele.resolver';
import { ScenarioComponent } from './modules/scenario-editor/scenarios/scenario/scenario.component';
import { ScenarioResolver } from './modules/scenario-editor/scenarios/scenario/scenario.resolver';
import { MxgraphComponent } from './modules/plastron/editeur/mxgraph/mxgraph.component';

const routes: Routes = [
{path: '', redirectTo: '/connexion', pathMatch: 'full'},
{path: 'connexion', component: ConnexionComponent},
{path: 'ngmxgraph', component: MxgraphComponent},
{path: 'accueil', component: AccueilComponent,canActivate: [AuthGuard]},
{path: 'regles', component: ReglesComponent,canActivate: [AuthGuard]},
{path: 'editeur', component: ScenarioEditorComponent,canActivate: [AuthGuard]},
{path: 'plastron/:id', component: PlastronComponent,resolve: { data: PlastronResolver },canActivate: [AuthGuard]},
{path: 'scenario/:id', component: ScenarioComponent,resolve: { data: ScenarioResolver },canActivate: [AuthGuard]},
{path: 'modele/:id', component: ModeleComponent,resolve: { data: ModeleResolver },canActivate: [AuthGuard]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
