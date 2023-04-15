import { Collection } from "../services/firebase.service";


export interface Profil extends Collection{
    sexe:boolean;
    age:number;
}
