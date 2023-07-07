import { Component } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

@Component({
  selector: 'app-scenario-editor',
  templateUrl: './scenario-editor.component.html',
  styleUrls: ['./scenario-editor.component.less']
})
export class ScenarioEditorComponent {

  tab:string;

    constructor(
    private route: ActivatedRoute,

  ) {}


  ngOnInit() {
  this.route.queryParams.subscribe((params) => {
    if (params['tab']) {
      this.tab = params['tab'];
      console.log("tab ",params['tab'])
    }
  });
}

}
