import { Observable, forkJoin, map, of } from 'rxjs';
import { Groupe } from './groupe';
import { Listable } from '../interfaces/listable';
import { Modele } from './modele';
import { Profil } from './profil';
import { Vertex } from './vertex';
import { PlastronService } from '../../services/plastron.service';

export enum Statut {
  Todo = 'A faire',
  Done = 'Terminé',
  Doing = 'En cours',
}

export class Plastron extends Vertex {
  groupe: Groupe;
  modele: Modele;
  profil: Profil;
  statut: Statut;

  public static override className = 'Plastron';

  constructor(object?: any) {
    super(object);
    this.groupe = object?.groupe ? object.groupe : undefined;
    this.modele = object?.modele ? object.modele : new Modele();
    this.profil = object?.profil ? object.profil : new Profil();
    this.statut = object?.statut ? object.statut : Statut.Todo;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    console.log('instanciateListe ',list)
    return list.map(element => new Plastron(element) as T)
  }



  initModeleProfil(plastronService:PlastronService):Observable<Plastron> {
    const requestsModele = plastronService.getPlastronModele(this.id);

    const requestsProfil = plastronService.getPlastronProfil(this.id);

    return forkJoin([requestsModele, requestsProfil])
    .pipe(map((modeleProfil:[Modele,Profil]) =>{
      this.modele = modeleProfil[0]
      this.profil = modeleProfil[1]
      return this
    }));
  }
}
