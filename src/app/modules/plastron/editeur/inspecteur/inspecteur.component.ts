import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Trend } from 'src/app/models/vertex/node';
import {
  VariablePhysio,
  VariablePhysioInstance,
} from 'src/app/models/vertex/variablePhysio';

@Component({
  selector: 'app-inspecteur',
  templateUrl: './inspecteur.component.html',
  styleUrls: ['./inspecteur.component.less'],
})
export class InspecteurComponent implements OnInit {
  @Input() variables: VariablePhysioInstance[];
  @Input() trends: Trend[];
  @Input() disabled: boolean = false;

  @Output() updateVariable = new EventEmitter<VariablePhysioInstance>();

  constructor() {}

  ngOnInit(): void {}

  getTrendByCible(target: string): Trend[] {
    return this.trends.filter((trend: Trend) => trend.target == target);
  }
}
