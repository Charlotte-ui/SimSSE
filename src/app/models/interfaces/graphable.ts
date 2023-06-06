import { Modele } from "../vertex/modele";

export interface Graphable {
  nodeToUpdate: string[];
  nodeToDelete: string[];
  linkToUpdate: string[];
  linkToDelete: string[];
  changesToSave:boolean;
  champToUpdate: string[];
  newTrigger: boolean;

  save: () => void;
}
