import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Plastron } from '../../models/vertex/plastron';
import { FirebaseService } from '../../services/firebase.service';
import { PlastronService } from '../../services/plastron.service';

@Injectable({
  providedIn: 'root'
})
export class PlastronResolver implements Resolve<Plastron> {

  constructor(public plastronService: PlastronService,private router: Router) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<Plastron> {
    const plastronId = route.paramMap.get('id');
    return new Promise<Plastron| undefined>((resolve) => {



       this.plastronService
      .getPlastronById(plastronId)
      .subscribe((plastron:Plastron) => {

        plastron!.id = plastronId;

        resolve(plastron as Plastron);
      });
    }); 

  }
}
