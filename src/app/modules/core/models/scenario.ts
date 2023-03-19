import { Listable } from './listable';


export interface Scenario extends Listable{
    impliques:string;
    psy:string;
    UA:number;
    UR:number;
    EU:number;


}