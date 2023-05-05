import { Observable, forkJoin } from 'rxjs';
import { Groupe } from './groupe';
import { Listable } from './interfaces/listable';
import { Modele } from './modele';
import { Profil } from './profil';
import { Vertex } from './vertex';
import { PlastronService } from '../services/plastron.service';

export enum Statut {
  Todo = 'A faire',
  Done = 'Terminé',
  Doing = 'En cours',
}

export class Plastron extends Vertex {
  tags: string[];
  groupe: Groupe;
  modele: Modele;
  profil: Profil;
  statut: Statut;

  public static override className = 'Plastron';

  constructor(object?: any) {
    super(object);
    this.tags = object?.tags ? object.tags : [];
    this.groupe = object?.groupe ? object.groupe : undefined;
    this.modele = object?.modele ? object.modele : new Modele();
    this.profil = object?.profil ? object.profil : new Profil();
    this.statut = object?.statut ? object.statut : Statut.Todo;
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    let res: T[] = [];
    list.forEach((element) => {
      res.push(new Plastron(element) as T);
    });

    return res;
  }

  initModeleProfil(plastronService:PlastronService):Observable<[Modele, Profil]> {
    const requestsModele = plastronService.getPlastronModele(this.id);

    const requestsProfil = plastronService.getPlastronProfil(this.id);

    return forkJoin([requestsModele, requestsProfil]);
  }
}
