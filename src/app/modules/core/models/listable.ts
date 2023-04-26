import { Collection } from "../services/firebase.service";


export interface Listable extends Collection{
    title:string;
    description:string;
}