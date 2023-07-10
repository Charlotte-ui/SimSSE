import { EventType, Limits, LinkType, NodeType } from '../models/vertex/node';
import { getElementByChamp } from './tools';

export interface IButton {
  name: string;
  type: string;
  icon: string;
  color: string;
  outils: boolean; // le bouton est-il dans la barre d'outils ?
  symbol: string;
  event: string;
  tooltip: string;
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
  category: 'Catégorie',
  med: 'Med',
  paraMed: 'Paramed',
  start: 'Activation',
  template: 'Groupe',
  decede: 'Décédé',
  trigger: 'Déclencheur',
  groupToStore: 'Groupe',
  source: 'Variable cause',
  threshold: 'Valeur seuil',
  comparison: 'Opérateur de comparaison',
  limit: 'Limite',
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
  'threshold',
];

const listable = [
  'source',
  'target',
  'event',
  'in',
  'out',
  'triage',
  'category',
  'groupToStore',
];

const listableWithGroupe = ['event', 'template'];

const booleans = ['start', 'med', 'paraMed', 'secouriste', 'trigger', 'limit'];

/**
 * How to show the boolean labels by type
 */
const booleanLabels = new Map([
  [
    'limit',
    [
      { value: Limits.extremum, label: 'Extrenum' },
      { value: Limits.target, label: 'Cible' },
    ]
  ],[
    'trigger',
    [
      { value: LinkType.start, label: 'Start' },
      { value: LinkType.pause, label: 'Pause' },
      { value: LinkType.stop, label: 'Stop' },
    ],
  ]
]);

export class Button {
  static buttons: IButton[] = [
    {
      name: 'Tendance',
      type: NodeType.trend,
      icon: 'assets/icons/trend.png',
      color: '#FDFF83',
      outils: true,
      symbol: 'roundRect',
      event: 'add',
      tooltip: 'Ajouter une tendance',
    },
    {
      name: '',
      type: 'addMultiple',
      icon: 'assets/icons/addstart.png',
      color: '#FDFF83',
      outils: true,
      symbol: 'roundrect',
      event: 'addMultiple',
      tooltip: 'Ajouter plusieurs tendances à T0',
    },
    {
      name: 'Action',
      type: EventType.action,
      icon: 'assets/icons/action.png',
      color: '#86B4C1',
      outils: true,
      symbol: 'roundRect',
      event: 'add',
      tooltip: 'Ajouter une action',
    },
    {
      name: 'Bio-évenement',
      type: EventType.bio,
      icon: 'assets/icons/bio.png',
      color: '#FC9E4F',
      outils: true,
      symbol: 'roundRect',
      event: 'add',
      tooltip: 'Ajouter un événement biologique',
    },
    {
      name: 'Timer',
      type: NodeType.timer,
      icon: 'assets/icons/timer.png',
      color: '#DFFFD9',
      outils: true,
      symbol: 'roundRect',
      event: 'add',
      tooltip: 'Ajouter un timer',
    },
    {
      name: 'Lien',
      type: NodeType.link,
      icon: 'assets/icons/link.png',
      color: '#5CFFC0',
      outils: true,
      symbol: 'roundRect',
      event: 'add',
      tooltip: 'Lier deux noeud entre eux',
    },
    {
      name: 'Groupe',
      type: NodeType.graph,
      icon: 'assets/icons/addgraph.png',
      color: '#FAE4FF',
      outils: true,
      symbol: 'roundRect',
      event: 'add',
      tooltip: 'Ajouter un groupe',
    },
    {
      name: 'Start',
      type: EventType.start,
      icon: 'assets/icons/start.png',
      color: '#000000',
      outils: false,
      symbol: 'rect',
      event: 'add',
      tooltip: '',
    },
    {
      name: 'Modele',
      type: 'modele',
      icon: 'assets/icons/modele.png',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
      event: 'add',
      tooltip: '',
    },
    {
      name: 'Scenario',
      type: 'scenario',
      icon: 'assets/icons/scenario.png',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
      event: 'add',
      tooltip: '',
    },
    {
      name: 'Plastron',
      type: 'plastron',
      icon: 'assets/icons/plastron.png',
      color: '#FFFFFF',
      outils: false,
      symbol: 'rect',
      event: 'add',
      tooltip: '',
    },
    {
      name: 'Trigger',
      type: 'trigger',
      icon: 'assets/icons/trigger.png',
      color: '#86B4C1',
      outils: false,
      symbol: 'rect',
      event: 'add',
      tooltip: `Ajouter un déclencheur d'action`,
    },
    {
      name: 'TimeStamp',
      type: 'timestamp',
      icon: 'add_alarm',
      color: '#ffffff',
      outils: false,
      symbol: 'rect',
      event: 'add',
      tooltip: '',
    },
    {
      name: '',
      type: NodeType.graph,
      icon: 'assets/icons/storegraph.png',
      color: '#FAE4FF',
      outils: true,
      symbol: 'roundrect',
      event: 'store',
      tooltip: 'Stocker un groupe en base de donnée',
    },
    {
      name: '',
      type: 'editor',
      icon: 'assets/icons/editor.png',
      color: '',
      outils: false,
      symbol: '',
      event: '',
      tooltip: "Accéder à l'éditeur de scenario",
    },
    {
      name: '',
      type: 'admin',
      icon: 'assets/icons/admin.png',
      color: '',
      outils: false,
      symbol: '',
      event: '',
      tooltip: 'Accéder à la partie administrateur',
    },
    {
      name: '',
      type: 'animator',
      icon: 'assets/icons/animator.png',
      color: '',
      outils: false,
      symbol: '',
      event: '',
      tooltip: 'Accéder à la console animateur',
    },
    {
      name: '',
      type: 'retex',
      icon: 'assets/icons/retex.png',
      color: '',
      outils: false,
      symbol: '',
      event: '',
      tooltip: 'Accéder au RETEX',
    },
    //  {name:"End",type:EventType.start,icon:'output',color:'#FFFFFF',outils:false},
  ];

  constructor() {}

  public static getButtonByType(type: string): IButton | undefined {
    return getElementByChamp<IButton>(Button.buttons, 'type', type);
  }

  public static getType(champ: string) {
    if (numbers.includes(champ)) return 'number';
    if (champ == 'color') return 'color';
    if (listableWithGroupe.includes(champ)) return 'listeGroupe';
    if (listable.includes(champ)) return 'liste';
    if (booleans.includes(champ)) return 'boolean';
    return 'text';
  }

  public static getBooleanValue(type:string){
    let boolVal =  booleanLabels.get(type);
    if (boolVal) return boolVal;
    else return [
      { value: true, label: 'Vrai' },
      { value: false, label: 'Faux' },
    ] 
  }
}
