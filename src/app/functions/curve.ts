import { Modele } from '../models/vertex/modele';
import {
  Graph,
  NodeType,
  Timer,
  Node,
  Trend,
  LinkType,
  EventType,
  Event,
  Limits,
} from '../models/vertex/node';
import { Trigger } from '../models/trigger';
import { VariablePhysioInstance } from '../models/vertex/variablePhysio';
import {
  getElementByChampMap,
  getNodeByID,
  roundingWithDecimal,
} from './tools';
import { BioEvent, Comparison } from '../models/vertex/event';
import { Button } from './display';

export class Curve {
  name: string;
  values: number[][]; // x,y
  currentMax: number;
  duration: number;
  variable: VariablePhysioInstance;
  color: string;
  private trend: number;
  private prevValue: number;

  constructor(
    name: string,
    duration?: number,
    variable?: VariablePhysioInstance,
    color?: string
  ) {
    this.name = name;
    this.duration = duration ? duration : 0;
    this.variable = variable ? variable : undefined;
    this.color = color ? color : '#d5ceeb';
    this.values = [];
  }

  /**
   * generate the curves
   * @param size
   * @param variable
   * @returns the new triggeredEvents with the events that have been triggered during the calcul of curve
   */
  public static calculCurves(
    modele: Modele,
    curves: Map<string, Curve>,
    duration: number
  ): Map<string, Trigger> {
    console.log("calculCurves")
    this.setAllNodesStatesToFalse(modele.graph);

    curves.forEach((curve: Curve) => {
      curve.prevValue = curve.variable.cible; // at t=0 the previous value is the target
      curve.trend = 0; //by default there is no trend, the curve is constante
    });

    for (let i = 0; i < duration; i++) {
      this.updateNodesStates(i, modele, curves); // each minute that pass we updates the states of the nodes

      curves.forEach((curve: Curve) => {

        if (i > 0) curve.prevValue = curve.values[i - 1][1];
        if (modele.graph.nodes) curve.trend = curve.calculTrend(modele); // si les nodes sont initialisés, ont les utilisent pour déterminer les changements de trend
        let newValue = roundingWithDecimal(curve.prevValue + curve.trend, 2);
        //let newValue = variable.cible + i*trend + this.gaussianRandom(0, variable.rand) ;

        if (newValue > curve.variable.max) newValue = curve.variable.max;
        if (newValue < curve.variable.min) newValue = curve.variable.min;
        curve.values[i] = [i, newValue];
      });
    }

    // add the gaussian random
    curves.forEach((curve: Curve) =>
      curve.values.map(
        (value: number[]) =>
          (value[1] = value[1] + this.gaussianRandom(0, curve.variable.rand))
      )
    );

    return modele.triggeredEvents;
  }

  /**
   * set a node active or inactive at time t
   * @param t
   */
  private static updateNodesStates(
    t: number,
    modele: Modele,
    curves: Map<string, Curve>
  ) {
    Curve.updateNodeStatesRecursive(
      modele.triggeredEvents,
      modele.graph,
      t,
      curves
    );
  }

  /**
   * recursive methode pour modifer les états des noeuds caché en profondeur dans les graphs
   * @param graph
   * @param t
   */
  private static updateNodeStatesRecursive(
    triggeredEvents: Map<string, Trigger>,
    graph: Graph,
    t: number,
    curves: Map<string, Curve>
  ) {
    triggeredEvents.forEach((trigger) => {
      if (trigger.time == t) {
        // event trigger at time t
        graph.links.forEach((link) => {
          let eventNode = getNodeByID(graph, link.out);
          console.log("eventNode ",eventNode)
          if (eventNode && (
            trigger.in == eventNode.id ||
            trigger.in == eventNode['event'])
          ) {
            let nodeTrigger = getNodeByID(graph, link.in);
            console.log("nodeTrigger ",nodeTrigger)

            if (nodeTrigger) {
              nodeTrigger.state =
                nodeTrigger.state === LinkType.stop
                  ? LinkType.stop
                  : link.trigger;
              // a stop node cannot be start again
              if (nodeTrigger.type == NodeType.graph) {
                if (nodeTrigger.state)
                  this.updateNodeStatesRecursive(
                    triggeredEvents,
                    nodeTrigger as Graph,
                    t,
                    curves
                  );
                // si le node est un graph, on updte les états des nodes internes
                else this.setAllNodesStatesToFalse(nodeTrigger as Graph); // desctivate all nodes states
              }
            }
          }
        });
      }
    });

    //update all the graph who could have been triggered internaly
    graph.nodes.forEach((node) => {
      if (node.type == NodeType.graph && node.state === LinkType.start)
        this.updateNodeStatesRecursive(
          triggeredEvents,
          node as Graph,
          t,
          curves
        );
      else if (node.type == NodeType.timer && node.state === LinkType.start)
        this.advanceTimer(node as Timer, t, triggeredEvents);
      else if (
        Node.getType(node) === EventType.bio &&
        node.state !== LinkType.start
      ) {
        let bioEvent = BioEvent.bioevents.get((node as Event).template.id);
        let curve = curves.get(bioEvent.source);

        if (
          (bioEvent.comparison === Comparison.sup &&
            curve.prevValue > bioEvent.threshold) ||
          (bioEvent.comparison === Comparison.inf &&
            curve.prevValue < bioEvent.threshold)
        ) {
          console.log(
            'prevValue ',
            curve.prevValue,
            ' threshold ',
            bioEvent.threshold
          );
          console.log('curve ', curve.name, ' ', curve.prevValue);
          console.log('bioEvent ', bioEvent);
          console.log('t ', t);
          this.triggerBioEvent(node as Event, t, triggeredEvents);
        }
      }
    });
  }

  /**
   * determinate the trend for the variable at time i
   * depend of the current (i) states of the nodes
   * @param variable
   * @param i
   * @returns
   */
  private calculTrend(modele: Modele) {
    // console.log("calculTrend "+this.variable.name)
    let trend = 0;
    let trends = this.calculTrendRecursive(this.variable, modele.graph.nodes);
    // s'il y a plusieur trend d'actives sur une même variable en même temps, on leur appliquent une fonction pour réduire à une trend
    if (trends.length > 0) trend = this.reduceTrends(trends);
    return trend;
  }

  private reduceTrends(trends: number[]): number {
    return trends.reduce((x, y) => x + y); // /array.length // somme des trend
  }

  /**
   * recursive methode qui va chercher les trends en profondeur dans les graphs
   * @param variable
   * @param i
   * @returns
   */
  private calculTrendRecursive(
    variable: VariablePhysioInstance,
    nodes: Map<string, Node>
  ) {
    let trends: number[] = [];
    nodes.forEach((node) => {
      //console.log("node ",node)
      // si le node est actif
      if (node.state === LinkType.start) {
        // if node is a trend
        if (node.type == NodeType.trend) {
          let nodeTrend = node as Trend;
          if (
            nodeTrend.target == variable.template &&
              (nodeTrend.limit === Limits.extremum ||
            (this.prevValue >= variable.cible && nodeTrend.parameter < 0) ||
            (this.prevValue <= variable.cible && nodeTrend.parameter > 0))
          ) {
            trends.push(Number(nodeTrend.parameter));
          }
        }

        if (node.type == NodeType.graph) {
          // si le node est un graph

          let graphTrends = this.calculTrendRecursive(
            variable,
            (node as Graph).nodes
          );
          trends = trends.concat(graphTrends);
        }
      }
    });
    return trends;
  }

  private static advanceTimer(
    timer: Timer,
    t: number,
    triggeredEvents: Map<string, Trigger>
  ) {
    timer.counter++;
    if (timer.counter == timer.duration) {
      // if the timer has ended

      triggeredEvents.set(
        timer.id,
        new Trigger({
          time: t + 1,
          in: timer.id,
          editable: false,
          id: timer.id,
          name: timer.name,
          color: Button.getButtonByType(NodeType.timer).color,
        })
      );
      timer.state = LinkType.pause; // the timer end
    }
  }

  private static triggerBioEvent(
    bioevent: Event,
    t: number,
    triggeredEvents: Map<string, Trigger>
  ) {
    // the bioevent triggered one time when the thresold is pass
    triggeredEvents.set(
      bioevent.template.id + ':1',
      new Trigger({
        time: t - 2,
        in: bioevent.id,
        editable: false,
        id: bioevent.template.id + ':1',
        name: bioevent.template.name,
        color: Button.getButtonByType(EventType.bio).color,
      })
    );

    bioevent.state = LinkType.start;
  }

  private static setAllNodesStatesToFalse(graph: Graph) {
    graph.nodes.forEach((node: Node) => {
      node.state =
        node.state === LinkType.stop ? LinkType.stop : LinkType.pause;
      if (node.type == NodeType.graph)
        this.setAllNodesStatesToFalse(node as Graph);
    });
  }

  // Standard Normal variate using Box-Muller transform.
  private static gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }
}
