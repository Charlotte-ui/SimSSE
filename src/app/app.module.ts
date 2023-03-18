import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConnexionComponent } from './modules/connexion/connexion.component';
import { HeaderComponent } from './modules/core/header/header.component';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ScenarioComponent } from './modules/scenario/scenario.component';
import { PlastronComponent } from './modules/plastron/plastron.component';
import { SceneComponent } from './modules/plastron/editeur/scene/scene.component';

@NgModule({
  declarations: [
    AppComponent,
    ConnexionComponent,
    HeaderComponent,
    AccueilComponent,
    ScenarioComponent,
    PlastronComponent,
    SceneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
