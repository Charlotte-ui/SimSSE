import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

import {MatCardModule} from '@angular/material/card'; 
import {MatListModule} from '@angular/material/list'; 
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConnexionComponent } from './modules/core/connexion/connexion.component';
import { HeaderComponent } from './modules/core/header/header.component';
import { AccueilComponent } from './modules/accueil/accueil.component';
import { ScenarioComponent } from './modules/scenario/scenario.component';
import { PlastronComponent } from './modules/plastron/plastron.component';
import { SceneComponent } from './modules/plastron/editeur/scene/scene.component';
import { ListBoxComponent } from './modules/shared/list-box/list-box.component';
import { ListBoxElementComponent } from './modules/shared/list-box/list-box-element/list-box-element.component';

@NgModule({
  declarations: [
    AppComponent,
    ConnexionComponent,
    HeaderComponent,
    AccueilComponent,
    ScenarioComponent,
    PlastronComponent,
    SceneComponent,
    ListBoxComponent,
    ListBoxElementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFirestoreModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MatCardModule,
    MatListModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: environment.firebase }],
  bootstrap: [AppComponent]
})
export class AppModule { }
