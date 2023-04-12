import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-triage',
  templateUrl: './triage.component.html',
  styleUrls: ['./triage.component.less']
})
export class TriageComponent {

  @Input()triage:string;

}
