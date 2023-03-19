import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ConnexionComponent } from './modules/core/connexion/connexion.component';
import { AuthGuard } from './modules/core/auth.guard';

const routes: Routes = [
{path: '', redirectTo: '/connexion', pathMatch: 'full'},
{path: 'connexion', component: ConnexionComponent},
{path: 'accueil', component: AccueilComponent,canActivate: [AuthGuard]}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
