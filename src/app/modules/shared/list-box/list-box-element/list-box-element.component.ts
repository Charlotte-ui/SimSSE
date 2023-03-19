import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-box-element',
  templateUrl: './list-box-element.component.html',
  styleUrls: ['./list-box-element.component.less']
})
export class ListBoxElementComponent {

  
  @Input() titre!: string;
  @Input() description!: string;

}
