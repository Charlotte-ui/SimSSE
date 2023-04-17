import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

import { NgxEchartsModule } from 'ngx-echarts';


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
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {MatRadioModule} from '@angular/material/radio';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

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
import { TriggerDialogComponent } from './modules/plastron/editeur/scene/trigger-dialog/trigger-dialog.component';
import { VariableControllerComponent } from './modules/plastron/editeur/inspecteur/variable-controller/variable-controller.component';
import { ReglesComponent } from './modules/regles/regles.component';
import { TabReglesComponent } from './modules/regles/tab-regles/tab-regles.component';
import { AddRegleDialogComponent } from './modules/regles/tab-regles/add-regle-dialog/add-regle-dialog.component';
import { ConfirmDeleteDialogComponent } from './modules/core/confirm-delete-dialog/confirm-delete-dialog.component';
import { TriageComponent } from './modules/shared/triage/triage.component';
import { TagsDescriptionsComponent } from './modules/plastron/tags-descriptions/tags-descriptions.component';
import { GraphDialogComponent } from './modules/plastron/editeur/graph-dialog/graph-dialog.component';
import { TagsComponent } from './modules/shared/tags/tags.component';
import { CarteComponent } from './modules/scenario/carte/carte.component';
//import { PopupComponent } from './popup/popup.component';

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
    NodeDialogComponent,
    TriggerDialogComponent,
    VariableControllerComponent,
    ReglesComponent,
    TabReglesComponent,
    AddRegleDialogComponent,
    ConfirmDeleteDialogComponent,
    TriageComponent,
    TagsDescriptionsComponent,
    GraphDialogComponent,
    TagsComponent,
    CarteComponent
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
    FormsModule,
    MatButtonModule,
    NgbModule,
    MatExpansionModule,
    CdkAccordionModule,
    MatRadioModule,
    DragDropModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: environment.firebase },ScenarioResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
