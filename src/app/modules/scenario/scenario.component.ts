import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Scenario } from '../core/models/scenario';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.less']
})
export class ScenarioComponent implements OnInit {

  scenario!: Scenario ;


  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (response) => {
        this.scenario = response['data'];
      },
      (error:any) => {
        console.log(error);
      }
    );
  }

}
