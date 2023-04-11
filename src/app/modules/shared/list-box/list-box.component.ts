import { Component, Input } from '@angular/core';
import { Listable } from '../../core/models/listable';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-box',
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.less']
})
export class ListBoxComponent {

  _type:string;

  @Input() titre!: string;
  @Input() sousTitre!: string;
  @Input() set type(value:string){
    if(value) {
      this._type = value;
      this.firebaseService.getCollectionById<Listable>(value).subscribe(
        (elements) =>
          (this.elements = elements)
      );
    }
  };


  elements!: Listable[];

  constructor(private router: Router,public firebaseService:FirebaseService) {

    this.elements = [];




  }

  goToElement(elementId:string){

    console.log(elementId)
    this.router.navigate(['/'+this._type.toLowerCase()+"/"+elementId]);


  }

  addElement(){

  }


}
