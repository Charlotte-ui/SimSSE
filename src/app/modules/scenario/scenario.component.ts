import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Groupe } from '../core/models/groupe';
import { Scenario } from '../core/models/scenario';
import { FirebaseService } from '../core/services/firebase.service';
import { ScenarioService } from '../core/services/scenario.service';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less']
})
export class ScenarioComponent implements OnInit {

  scenario!: Scenario ;
  groupes!: Groupe[];

  scenarioFormGroup = this.form.group(this.scenario);


  constructor(private route: ActivatedRoute,private form: FormBuilder,public scenarioService:ScenarioService) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (response) => {
        this.scenario = response['data'];

        this.scenarioService.getScenarioGroupes(this.scenario.id).subscribe(
          (groupes) =>
            (this.groupes = groupes)
        );

      },
      (error:any) => {
        console.log(error);
      }
    );
  }

}
