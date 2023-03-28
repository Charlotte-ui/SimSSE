import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

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
import { MatTableModule } from '@angular/material/table'  
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatIconModule} from '@angular/material/icon'; 
import {MatDividerModule} from '@angular/material/divider'; 
import {MatSelectModule} from '@angular/material/select'; 
import {MatTabsModule} from '@angular/material/tabs'; 
import {MatGridListModule} from '@angular/material/grid-list'; 
import { NgxEchartsModule } from 'ngx-echarts';
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import { FormsModule } from '@angular/forms';

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
import { ScenarioResolver } from './modules/scenario/scenario.resolver';
import { EditeurComponent } from './modules/plastron/editeur/editeur.component';
import { ProfilComponent } from './modules/plastron/profil/profil.component';
import { BarreOutilsComponent } from './modules/plastron/editeur/barre-outils/barre-outils.component';
import { InspecteurComponent } from './modules/plastron/editeur/inspecteur/inspecteur.component';
import { EditeurGrapheNodalComponent } from './modules/plastron/editeur/editeur-graphe-nodal/editeur-graphe-nodal.component';
import { NodeDialogComponent } from './modules/plastron/editeur/editeur-graphe-nodal/node-dialog/node-dialog.component';



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
    ListBoxElementComponent,
    EditeurComponent,
    ProfilComponent,
    BarreOutilsComponent,
    InspecteurComponent,
    EditeurGrapheNodalComponent,
    NodeDialogComponent
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
    MatInputModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatTabsModule,
    MatGridListModule,
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
    MatDialogModule,
    MatFormFieldModule,
    FormsModule
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: environment.firebase },ScenarioResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
