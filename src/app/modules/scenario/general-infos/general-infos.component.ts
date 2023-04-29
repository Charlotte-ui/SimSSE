import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScenarioService } from '../../core/services/scenario.service';
import { FormBuilder } from '@angular/forms';
import { Scenario } from '../../core/models/scenario';
import { RegleService } from '../../core/services/regle.service';

@Component({
  selector: 'app-general-infos',
  templateUrl: './general-infos.component.html',
  styleUrls: ['./general-infos.component.less']
})
export class GeneralInfosComponent {

  scenarioFormGroup;

  allTags ;
  displayedColumns: string[] = ['total', 'totalParticipant', 'totalPlastron'];

  dataTotal = [{toal: "", totalPlastron: 0, totalParticipant: 0}]

  _scenario:Scenario;

  get scenario(): Scenario {
    return this._scenario;
  }
  @Input() set scenario(value: Scenario) {
    if (value) { // if value isnt undefined
      this._scenario = value;
      this.scenarioFormGroup = this.form.group(this.scenario);
      this.dataTotal[0].totalPlastron = this.scenario.EU + this.scenario.UA + this.scenario.UR;
      this.dataTotal[0].totalParticipant = this.dataTotal[0].totalPlastron + this.scenario.impliques + this.scenario.psy;
      this.newTotalPlastron.emit(this.dataTotal[0].totalPlastron);
    }
  }

  
  @Output() newTotalPlastron = new EventEmitter<number>();


  constructor(
    private form: FormBuilder,
    public scenarioService:ScenarioService,
    public regleService:RegleService) {

       this.regleService.getAllTagsPlastron().subscribe((response) => {
        this.allTags = response;
      });
    }

}
