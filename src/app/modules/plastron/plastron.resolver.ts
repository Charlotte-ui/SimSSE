import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Plastron } from '../core/models/plastron';
import { FirebaseService } from '../core/services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class PlastronResolver implements Resolve<Plastron> {

  constructor(public firebaseService: FirebaseService,private router: Router) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<Plastron> {
    const plastronId = route.paramMap.get('id');
    return new Promise<Plastron| undefined>((resolve) => {
       this.firebaseService
      .getElementInCollectionByIds<Plastron>("Plastron",plastronId)
      .subscribe((plastron:Plastron) => {

        plastron!.id = plastronId;

        resolve(plastron as Plastron);
      });
    }); 

  }
}
