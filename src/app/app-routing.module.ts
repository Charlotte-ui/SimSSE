import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ConnexionComponent } from './modules/core/connexion/connexion.component';

const routes: Routes = [
{path: '', redirectTo: '/accueil', pathMatch: 'full'},
{path: 'connexion', component: ConnexionComponent},
{path: 'accueil', component: AccueilComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
