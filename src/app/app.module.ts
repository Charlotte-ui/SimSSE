import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

import { NgxEchartsModule } from 'ngx-echarts';
import { NgImageSliderModule } from 'ng-image-slider';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatCheckboxModule} from '@angular/material/checkbox'; 
import {MatMenuModule} from '@angular/material/menu'; 
 import {MatPaginatorModule} from '@angular/material/paginator'; 
  
import { ConnexionComponent } from './modules/connexion/connexion.component';
import { HeaderComponent } from './modules/shared/header/header.component';
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
import { DialogComponent } from './modules/shared/dialog/dialog.component';
import { TriggerDialogComponent } from './modules/plastron/editeur/scene/trigger-dialog/trigger-dialog.component';
import { VariableControllerComponent } from './modules/plastron/editeur/inspecteur/variable-controller/variable-controller.component';
import { ReglesComponent } from './modules/regles/regles.component';
import { TabReglesComponent } from './modules/regles/tab-regles/tab-regles.component';
import { ConfirmDeleteDialogComponent } from './modules/shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { TriageComponent } from './modules/shared/triage/triage.component';
import { TagsDescriptionsComponent } from './modules/plastron/tags-descriptions/tags-descriptions.component';
import { GraphDialogComponent } from './modules/plastron/editeur/graph-dialog/graph-dialog.component';
import { TagsComponent } from './modules/shared/tags/tags.component';
import { CarteComponent } from './modules/scenario/groupes/carte/carte.component';
import { GraphEditeurDialogComponent } from './modules/plastron/editeur/editeur-graphe-nodal/graph-editeur-dialog/graph-editeur-dialog.component';
import { ModeleComponent } from './modules/modele/modele.component';
import { GroupesComponent } from './modules/scenario/groupes/groupes.component';
import { GeneralInfosComponent } from './modules/scenario/general-infos/general-infos.component';
import { ModeleDialogComponent } from './modules/modele/modele-dialog/modele-dialog.component';
import { LotPlastronsComponent } from './modules/scenario/lot-plastrons/lot-plastrons.component';
import { WaitComponent } from './modules/shared/wait/wait.component';
import { TriageFilterComponent } from './modules/shared/triage-filter/triage-filter.component';
import { ScenariosComponent } from './modules/scenarios/scenarios.component';

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
    DialogComponent,
    TriggerDialogComponent,
    VariableControllerComponent,
    ReglesComponent,
    TabReglesComponent,
    ConfirmDeleteDialogComponent,
    TriageComponent,
    TagsDescriptionsComponent,
    GraphDialogComponent,
    TagsComponent,
    CarteComponent,
    GraphEditeurDialogComponent,
    ModeleComponent,
    GroupesComponent,
    GeneralInfosComponent,
    ModeleDialogComponent,
    LotPlastronsComponent,
    WaitComponent,
    TriageFilterComponent,
    ScenariosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
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
    MatAutocompleteModule,
    MatSortModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatMenuModule,
    NgImageSliderModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    ScenarioResolver,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
