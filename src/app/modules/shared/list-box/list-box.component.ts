import { Component, Input } from '@angular/core';
import { Listable } from '../../core/models/listable';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less']
})
export class ListBoxComponent {

  @Input() titre!: string;
  @Input() sousTitre!: string;
  @Input() set type(value:string){
    if(value) {
      this.firebaseService.getCollectionById<Listable>(value).subscribe(
        (elements) =>
          (this.elements = elements)
      );
    }
  };


  elements!: Listable[];

  constructor(public firebaseService:FirebaseService) {

    this.elements = [];


  

  }


}
