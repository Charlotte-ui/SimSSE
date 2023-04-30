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

export class Plastron extends Vertex implements Listable{
    title: string;
    description: string;
    tags: string[];
    id: string;
    groupe:Groupe;
    modele:Modele;
    profil:Profil;
    statut:Statut;

    public static override className = "Plastron"

    constructor(object?:any) {
        super(object);
        if(object["@rid"]) object["id"] = object["@rid"].substring(1)
        this.title = (object?.title)?object.title:"";
        this.description = (object?.description)?object.description:"";
        this.tags = (object?.tags)?object.tags:[];
        this.id = (object?.id)?object.id:"";
        this.groupe = (object?.groupe)?object.groupe:undefined;
        this.modele = (object?.modele)?object.modele:undefined;
        this.profil = (object?.profil)?object.profil:undefined;
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


      public initModelProfil(plastronService) {
        plastronService
            .getPlastronModele(this.id)
            .subscribe((modele: Modele) => {
         
              this.modele = modele;
            });
    
          plastronService
            .getPlastronProfil(this.id)
            .subscribe((profil: Profil) => {
      
              this.profil = profil;
            });
    
      }
}
