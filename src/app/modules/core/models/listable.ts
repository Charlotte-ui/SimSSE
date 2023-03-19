import { Collection } from "../services/firebase.service";


export interface Listable extends Collection{
    titre:string;
    description:string;
}