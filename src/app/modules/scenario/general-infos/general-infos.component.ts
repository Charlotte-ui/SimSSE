import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScenarioService } from '../../core/services/scenario.service';
import { FormBuilder } from '@angular/forms';
import { Scenario } from '../../core/models/vertex/scenario';
import { TagService } from '../../core/services/tag.service';
import { Tag } from '../../core/models/vertex/tag';

@Component({
  selector: 'app-general-infos',
  templateUrl: './general-infos.component.html',
  styleUrls: ['./general-infos.component.less'],
})
export class GeneralInfosComponent {
  scenarioFormGroup;
  allTags;
  displayedColumns: string[] = ['total', 'totalParticipant', 'totalPlastron'];

  dataTotal = [{ toal: '', totalPlastron: 0, totalParticipant: 0 }];

  _scenario: Scenario;

  get scenario(): Scenario {
    return this._scenario;
  }
  @Input() set scenario(value: Scenario) {
    if (value) {
      // if value isnt undefined
      this._scenario = value;
      this.scenarioFormGroup = this.form.group(this.scenario);

      console.log("scenario")
      console.log(value)

 
      this.scenarioFormGroup.valueChanges.subscribe((newScenario:Scenario) => {
          console.log('form value changed')
          console.log(newScenario)
          this.updateScenario.emit(newScenario)
      })

      this.dataTotal[0].totalPlastron =
        this.scenario.EU + this.scenario.UA + this.scenario.UR;
      this.dataTotal[0].totalParticipant =
        this.dataTotal[0].totalPlastron +
        this.scenario.impliques +
        this.scenario.psy;
      this.newTotalPlastron.emit(this.dataTotal[0].totalPlastron);
    }
  }

  @Output() newTotalPlastron = new EventEmitter<number>();
  @Output() updateScenario = new EventEmitter<Scenario>();
  @Output() updateTags = new EventEmitter<Tag[]>();


  constructor(
    private form: FormBuilder,
    public scenarioService: ScenarioService,
    public tagService: TagService
  ) {
    this.tagService.getAllTags('scenario').subscribe((response) => {
      this.allTags = response;
    });
  }
}
