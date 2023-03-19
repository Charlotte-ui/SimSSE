import { Collection } from "../services/firebase.service";

export interface Groupe extends Collection{
    impliques:string;
    psy:string;
    UA:number;
    UR:number;
    EU:number;
    scenario:string;
    scene:number;
}