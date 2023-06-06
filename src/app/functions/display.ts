import { EventType, NodeType } from '../models/vertex/node';
import { getElementByChamp } from './tools';

export interface IButton {
  name: string;
  type: string;
  icon: string;
  color: string;
  outils: boolean; // le bouton est-il dans la barre d'outils ?
  symbol: string;
}


export const champLabel = {
  name: 'Nom',
  title: 'Titre',
  target: 'Cible',
  parameter: 'Paramètre',
  event: 'Évènement',
  duration: 'Durée',
  out: 'Depuis',
  in: 'Vers',
  description: 'Description',
  psy: 'Nombre de cas psy',
  impliques: "Nombre d'impliqués sans cas clinique",
  UA: "Nombre d'urgence absolue (UA)",
  UR: "Nombre d'urgence relative (UR)",
  EU: "Nombre d'extrême urgence (EU)",
  triage: 'Triage',
  rand: 'Ecart-type',
  defaultValue: 'Valeur par défaut',
  min: 'Valeur minimum',
  max: 'Valeur maximum',
  color: 'Couleur',
  category:'Catégorie',
  med:'Med',
  paraMed:"Paramed",
  start:"Activation",
  template:'Groupe',
  decede:'Décédé'

};

const numbers = [
  'rand',
  'min',
  'max',
  'cible',
  'impliques',
  'psy',
  'UR',
  'EU',
  'UA',
  'x',
  'y',
  'parameter',
  'duration',
];

const listable = ['source', 'target', 'event', 'template', 'in', 'out', 'triage','category'];

const listableWithGroupe = ['event'];

const booleans = ['start','med','paraMed'];

export class Button {
  static buttons: IButton[] = [
    {
      name: 'Tendance',
      type: NodeType.trend,
      icon: 'timeline',
      color: '#FDFF83',
      outils: true,
      symbol: 'roundRect',
    },
    {
      name: 'Action',
      type: EventType.action,
      icon: 'touch_app',
      color: '#86B4C1',
      outils: true,
      symbol: 'roundRect',
    },
    {
      name: 'Évenement',
      type: EventType.bio,
      icon: 'healing',
      color: '#FC9E4F',
      outils: true,
      symbol: 'roundRect',
    },
    {
      name: 'Timer',
      type: NodeType.timer,
      icon: 'timer',
      color: '#DFFFD9',
      outils: true,
      symbol: 'roundRect',
    },
    {
      name: 'Lien',
      type: NodeType.link,
      icon: 'arrow_right_alt',
      color: '#5CFFC0',
      outils: true,
      symbol: 'roundRect',
    },
    {
      name: 'Groupe',
      type: NodeType.graph,
      icon: 'scatter_plot',
      color: '#FAE4FF',
      outils: true,
      symbol: 'roundRect',
    },
    {
      name: 'Start',
      type: EventType.start,
      icon: 'input',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
    },
    {
      name: 'Modele',
      type: 'modele',
      icon: 'folder_shared',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
    },
    {
      name: 'Scenario',
      type: 'scenario',
      icon: 'art_track',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
    },
    {
      name: 'Plastron',
      type: 'plastron',
      icon: 'accessibility_new',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
    },
    {
      name: 'Trigger',
      type: 'trigger',
      icon: 'add_alert',
      color: '#FEEA00',
      outils: false,
      symbol: 'rect',
    }
    ,
    {
      name: 'TimeStamp',
      type: 'timestamp',
      icon: 'add_alarm',
      color: '#ffffff',
      outils: false,
      symbol: 'rect',
    }
    //  {name:"End",type:EventType.start,icon:'output',color:'#FFFFFF',outils:false},
  ];

  constructor() {}

  public getButtonByType(type: string): IButton | undefined {
    return getElementByChamp<IButton>(Button.buttons,'type',type)
  }

  public static getType(champ: string) {
    if (numbers.includes(champ)) return 'number';
    if (champ == 'color') return 'color';
    if (listableWithGroupe.includes(champ)) return 'listeGroupe';
    if (listable.includes(champ)) return 'liste';
    if (booleans.includes(champ)) return 'boolean';
    return 'text';
  }
}
