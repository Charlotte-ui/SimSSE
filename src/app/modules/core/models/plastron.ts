import { Groupe } from './groupe';
import { Listable } from './listable';
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
    modele:string;
    profil:string;
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
        this.modele = (object?.modele)?object.modele:"";
        this.profil = (object?.profil)?object.profil:"";
        this.statut = (object?.statut)?object.statut:Statut.Todo;
    }
}
