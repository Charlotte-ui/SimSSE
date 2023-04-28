import { Collection } from "../services/firebase.service";

export interface Groupe extends Collection{
    impliques:number;
    psy:number;
    UA:number;
    UR:number;
    EU:number;
    scenario:string;
    scene:number;
    position:(number|string)[]
}
