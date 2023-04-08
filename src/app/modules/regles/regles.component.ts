import { Component } from '@angular/core';
import { VariablePhysio } from '../core/models/variablePhysio';
import { RegleService } from '../core/services/regle.service';

@Component({
  selector: 'app-regles',
  templateUrl: './regles.component.html',
  styleUrls: ['./regles.component.less']
})
export class ReglesComponent {
  
  variables!: VariablePhysio[];

  constructor(public regleService:RegleService){}

  ngOnInit(): void {
    this.regleService.getVariables().subscribe(
      (response) => {
        this.variables = response;
      }
    ); 
  }



}
