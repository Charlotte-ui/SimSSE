import { Template } from '../interfaces/templatable';
import { EventType } from './node';
import { Vertex } from './vertex';

export enum CategoryAction {
  eval = 'Évaluation clinique',
  M = 'M: MASSIVE BLEEDING CONTROL',
  A = 'A : AIRWAY. VOIES AÉRIENNES',
  R = 'R : RESPIRATION',
  C = 'C : CHOC',
  H = 'H : HEAD',
  divers = 'Divers',
  medicaments = 'Administration de médicaments',
}

export class Action extends Vertex implements Template {
  public static override className = 'Action';
  public static actions: Action[] = [];

  name: string;
  category: CategoryAction;
  med: boolean;
  paraMed: boolean;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    this.category = object?.category ? object.category : CategoryAction.divers;
    this.med = object?.med !== undefined ? object.med : true;
    this.paraMed = object?.paraMed !== undefined ? object.paraMed : true;

    Action.actions.push(this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new Action(element) as T);
  }

  public static override getType(element): string {
    return EventType.action;
  }

  public static getListByCategory() {
    let actions = [];
    let categories = Object.values(CategoryAction);

    categories.forEach((category) => {
      actions.push({
        category: category,
        disabled: category === CategoryAction.eval,
        elements: this.actions.filter(
          (action: Action) => action.category === category
        ),
      });
    });

    return actions;
  }
}

export class BioEvent extends Vertex implements Template {
  public static override className = 'BioEvent';
  public static bioevents: BioEvent[] = [];

  name: string;
  category: CategoryAction;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    this.category = object?.category ? object.category : CategoryAction.divers;
    BioEvent.bioevents.push(this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new BioEvent(element) as T);
  }

    public static getListByCategory() {
    let bioevents = [];
    let categories = Object.values(CategoryAction);

    categories.forEach((category) => {
      bioevents.push({
        category: category,
        disabled: category === CategoryAction.eval,
        elements: this.bioevents.filter(
          (bioevent: BioEvent) => bioevent.category === category
        ),
      });
    });

    return bioevents;
  }

  public static override getType(element): string {
    return EventType.bio;
  }
}