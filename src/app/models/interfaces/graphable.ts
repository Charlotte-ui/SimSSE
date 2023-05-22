import { Modele } from "../vertex/modele";

export interface Graphable {
  nodeToUpdate: string[];
  nodeToDelete: string[];
  linkToUpdate: string[];
  linkToDelete: string[];
  changesToSave:boolean;
  newModele: Modele;
  newTrigger: boolean;

  save: () => void;
}
