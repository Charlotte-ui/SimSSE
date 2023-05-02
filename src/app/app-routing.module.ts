import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ConnexionComponent } from './modules/core/connexion/connexion.component';
import { AuthGuard } from './modules/core/helpers/auth.guard';
import { ScenarioComponent } from './modules/scenario/scenario.component';
import { ScenarioResolver } from './modules/scenario/scenario.resolver';
import { PlastronComponent } from './modules/plastron/plastron.component';
import { PlastronResolver } from './modules/plastron/plastron.resolver';
import { ReglesComponent } from './modules/regles/regles.component';
import { ModeleComponent } from './modules/modele/modele.component';
import { ModeleResolver } from './modules/modele/modele.resolver';

const routes: Routes = [
{path: '', redirectTo: '/connexion', pathMatch: 'full'},
{path: 'connexion', component: ConnexionComponent},
{path: 'accueil', component: AccueilComponent,canActivate: [AuthGuard]},
{path: 'regles', component: ReglesComponent,canActivate: [AuthGuard]},
{path: 'plastron/:id', component: PlastronComponent,resolve: { data: PlastronResolver },canActivate: [AuthGuard]},
{path: 'scenario/:id', component: ScenarioComponent,resolve: { data: ScenarioResolver },canActivate: [AuthGuard]},
{path: 'modele/:id', component: ModeleComponent,resolve: { data: ModeleResolver },canActivate: [AuthGuard]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
