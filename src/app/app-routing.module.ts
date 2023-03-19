import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ConnexionComponent } from './modules/core/connexion/connexion.component';
import { AuthGuard } from './modules/core/auth.guard';
import { ScenarioComponent } from './modules/scenario/scenario.component';
import { ScenarioResolver } from './modules/scenario/scenario.resolver';

const routes: Routes = [
{path: '', redirectTo: '/connexion', pathMatch: 'full'},
{path: 'connexion', component: ConnexionComponent},
{path: 'accueil', component: AccueilComponent,canActivate: [AuthGuard]},
{path: 'scenario/:id', component: ScenarioComponent,resolve: { data: ScenarioResolver },canActivate: [AuthGuard]}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
