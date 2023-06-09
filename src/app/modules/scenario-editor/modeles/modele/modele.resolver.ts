import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Modele } from 'src/app/models/vertex/modele';
import { ModeleService } from 'src/app/services/modele.service';


@Injectable({
  providedIn: 'root'
})
export class ModeleResolver implements Resolve<Modele> {



  constructor(public modeleService: ModeleService,private router: Router) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<Modele> {
    const modeleId = route.paramMap.get('id');
    return new Promise<Modele| undefined>((resolve) => {
       this.modeleService
      .getModeleById(modeleId)
      .subscribe((modele:Modele) => {

        modele!.id = modeleId;

        resolve(modele as Modele);
      });
    }); 

  }
}
