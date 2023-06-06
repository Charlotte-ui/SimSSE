import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Triage } from 'src/app/models/vertex/modele';

@Component({
  selector: 'app-triage-filter',
  templateUrl: './triage-filter.component.html',
  styleUrls: ['./triage-filter.component.less']
})
export class TriageFilterComponent {

  triages: Triage[] = [Triage.EU, Triage.UA, Triage.UR];

  @Input() filterTriage!: string[];

  @Input()  multiple:boolean;

  @Output() change = new EventEmitter<any>

}
