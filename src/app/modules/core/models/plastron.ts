import { Groupe } from './groupe';
import { Listable } from './listable';

export enum Statut {
    Todo = "A faire",
    Done = "Terminé",
    Doing = "En cours"
}

export interface Plastron extends Listable{
    groupe:Groupe;
    modele:string;
    profil:string;
    statut:Statut;
}
