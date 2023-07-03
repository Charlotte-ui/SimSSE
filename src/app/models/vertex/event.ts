import {
  getElementByChamp,
  pushWithoutDuplicateByChamp,
} from 'src/app/functions/tools';
import { Template } from '../interfaces/templatable';
import { EventType } from './node';
import { Vertex } from './vertex';
import { VariablePhysioTemplate } from './variablePhysio';

export enum Comparison {
  inf = '<',
  sup = '>',
}

export class Categorie extends Vertex {
  public static override className = 'Categorie';
  public static categories: Map<string, Categorie> = new Map<
    string,
    Categorie
  >();

  name: string;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    Categorie.categories.set(this.id, this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new Categorie(element) as T);
  }
}

export class Action extends Vertex implements Template {
  public static override className = 'Action';
  public static actions: Map<string, Action> = new Map<string, Action>();

  name: string;
  category: string;
  med: boolean;
  paraMed: boolean;
  secouriste: boolean;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    this.category = object?.category ? object.category : 'Divers';
    this.med = object?.med !== undefined ? object.med : true;
    this.paraMed = object?.paraMed !== undefined ? object.paraMed : true;
    this.secouriste =
      object?.secouriste !== undefined ? object.secouriste : true;

    Action.actions.set(this.id, this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new Action(element) as T);
  }

  public static override getType(element): string {
    return EventType.action;
  }

  public static getListByCategory() {
    let actions = [];
    let categories = Categorie.categories;

    categories.forEach((category: Categorie) => {
      actions.push({
        category: category.name,
        disabled: category.name === 'Évaluation clinique',
        elements: new Map(
          [...this.actions].filter(
            ([key, action]) => action.category === category.name
          )
        ),
      });
    });
    return actions;
  }
}

export class BioEvent extends Vertex implements Template {
  public static override className = 'BioEvent';
  public static bioevents: Map<string, BioEvent> = new Map<string, BioEvent>();

  name: string;
  source: string;
  threshold: number;
  comparison: Comparison;

  constructor(object?: any) {
    super(object);
    this.name = object?.name ? object.name : '';
    this.source = object?.source ? object.source : undefined;
    this.threshold = object?.threshold ? object.threshold : 0;
    this.comparison = object?.comparison ? object.comparison : Comparison.inf;
    BioEvent.bioevents.set(this.id, this);
  }

  public static override instanciateListe<T>(list: any[]): T[] {
    return list.map((element) => new BioEvent(element) as T);
  }

  public static getListByCategory() {
    let bioevents = [];

    VariablePhysioTemplate.variables.forEach((variable) => {
      bioevents.push({
        category: variable.name,
        disabled: false,
        elements: new Map(
          [...this.bioevents].filter(
            ([key, bioevent]) => bioevent.source === variable.id
          )
        ),
      });
    });

    return bioevents;
  }

  public static override getType(element): string {
    return EventType.bio;
  }
}
