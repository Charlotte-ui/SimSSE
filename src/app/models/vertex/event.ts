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

export class Action extends Vertex {
  public static override className = 'Action';
  public static actions: Action[] = [];

  name: string;
  category: string;
  med: boolean;
  paraMed: boolean;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    this.category = object?.category ? object.category : '';
    this.med = object?.med !== undefined ? object.med : true;
    this.paraMed = object?.paraMed !== undefined ? object.paraMed : true;

    Action.actions.push(this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new Action(element) as T);
  }

  public static getActionByID(id: string): Action {
    let result = undefined;
    Action.actions.forEach((action: Action) => {
      if (action.id == id) result = action;
    });
    return result;
  }

  public static override getType(element): string {
    return EventType.action;
  }

  public static getListByCategory() {
    let actions = [];
    let categories = Object.values(CategoryAction);

    categories.forEach((category) => {

        console.log("filter ",category,' ',this.actions.filter(
            (action: Action) => action.category === category
          )) ; 
      actions.push({
        category: category,
        disabled: (category === CategoryAction.eval),
        elements: this.actions.filter(
          (action: Action) => action.category === category
        ),
      });
    });
    console.log("this.actions ",this.actions)

    console.log("getListByCategory ",actions)

    return actions;
  }
}

export class BioEvent extends Vertex {
  public static override className = 'BioEvent';
  public static bioevents: BioEvent[] = [];

  name: string;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    BioEvent.bioevents.push(this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new BioEvent(element) as T);
  }

  public static getBioEventByID(id: string): BioEvent {
    let result = undefined;
    BioEvent.bioevents.forEach((bioevent: BioEvent) => {
      if (bioevent.id == id) result = bioevent;
    });
    return result;
  }

  public static override getType(element): string {
    return EventType.bio;
  }
}
