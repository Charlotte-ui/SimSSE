import { Groupe } from './groupe';
import { Listable } from './listable';
import { Modele } from './modele';
import { Profil } from './profil';
import { Vertex } from './vertex';

export enum Statut {
    Todo = "A faire",
    Done = "Terminé",
    Doing = "En cours"
}

export class Plastron extends Vertex {
    tags: string[];
    groupe:Groupe;
    modele:Modele;
    profil:Profil;
    statut:Statut;

    public static override className = "Plastron"

    constructor(object?:any) {
        super(object);
        this.tags = (object?.tags)?object.tags:[];
        this.groupe = (object?.groupe)?object.groupe:undefined;
        this.modele = (object?.modele)?object.modele:new Modele();
        this.profil = (object?.profil)?object.profil:new Profil();
        this.statut = (object?.statut)?object.statut:Statut.Todo;
    }

    public static override instanciateListe<T>(list: any[]): T[] {
        let res: T[] = [];
        console.log('instanciateListe');
    
        console.log(list);
    
        list.forEach((element) => {
          element['id'] = element['@rid'].substring(1); // delete the #
          res.push(new Plastron(element) as T);
        });
    
        return res;
      } 
}
