import { Modele } from './modele';
import { Graph, NodeType, Timer, Node, Trend } from './node';
import { Trigger } from './trigger';
import { VariablePhysioInstance } from './variablePhysio';

export class Curve {
  name: string;
  values: number[][]; // x,y
  currentMax: number;
  duration: number;
  variable: VariablePhysioInstance;
  color: string;

  constructor(
    name: string,
    duration?: number,
    variable?: VariablePhysioInstance,
    color?: string
  ) {
    this.name = name;
    this.duration = duration ? duration : 0;
    this.variable = variable ? variable : undefined;
    this.color = color ? '#' + color : '#d5ceeb';
    this.values = [];
    this.currentMax = 0;
  }

  /**
   * generate the curve
   * @param size
   * @param variable
   * @returns
   */
  public calculCurve(modele: Modele) {
    //console.group("calculCurve "+this.name)
    //console.group("modele")
    //console.group(modele)

    let trend = 0; //by default there is no trend, the curve is constante
    let prevValue = this.variable.cible; // at t=0 the previous value is the target

    this.values = [];
    this.currentMax = 0;

    for (let i = 0; i < this.duration; i++) {
      this.updateNodesStates(i, modele); // each minute that pass we updates the states of the nodes
      if (modele.graph.nodes) trend = this.calculTrend(modele); // si les nodes sont initialisés, ont les utilisent pour déterminer les changements de trend

      //  console.log(i+" "+trend)
      if (i > 0) prevValue = this.values[i - 1][1];

      let newValue = Math.round(
        prevValue + this.gaussianRandom(0, this.variable.rand) + trend
      );
      //let newValue = variable.cible + i*trend + this.gaussianRandom(0, variable.rand) ;

      if (newValue > this.variable.max) newValue = this.variable.max;
      if (newValue < this.variable.min) newValue = this.variable.min;
      if (this.currentMax < newValue) this.currentMax = newValue;

      this.values.push([i, newValue]);
    }
  }

  /**
   * set a node active or inactive at time t
   * @param t
   */
  private updateNodesStates(t: number, modele: Modele) {
    this.updateNodeStatesRecursive(modele.triggeredEvents, modele.graph, t);
  }

  /**
   * recursive methode pour modifer les états des noeuds caché en profondeur dans les graphs
   * @param graph
   * @param t
   */
  private updateNodeStatesRecursive(
    triggeredEvents: Trigger[],
    graph: Graph,
    t: number
  ) {
    triggeredEvents.forEach((trigger) => {
      if (trigger.time == t) {
        // event trigger at time t

        graph.links.forEach((link) => {
          if (trigger.id == link.out) {
            let nodeTrigger = this.getNodeByID(link.in, graph);

            //  let nodeTrigger = graph.nodes[Number(link.in)];
            if (nodeTrigger) {
              nodeTrigger.state = link.start;
              if (nodeTrigger.type == NodeType.graph) {
                if (nodeTrigger.state)
                  this.updateNodeStatesRecursive(
                    triggeredEvents,
                    nodeTrigger as Graph,
                    t
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
      if (node.type == NodeType.graph && node.state)
        this.updateNodeStatesRecursive(triggeredEvents, node as Graph, t);
      else if (node.type == NodeType.timer && node.state)
        this.advanceTimer(node as Timer, t, triggeredEvents);
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
    // console.log("calculTrend "+variable.name)
    let trend = 0;
    // s'il y a plusieur trend d'actives sur une même variable en même temps, on leur appliquent une fonction pour réduire à une trend
    let trends = this.calculTrendRecursive(this.variable, modele.graph.nodes);
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
    nodes: Node[]
  ) {
    let trends: number[] = []; // s'il y a plusieur trend d'actives sur une même variable en même temps, on leur appliquent une fonction pour réduire à une trend
    nodes.forEach((node) => {
      if (node.state) {
        // si le node est actif
        if (
          node.type == 'trend' &&
          (node as Trend).target == variable.template
        ) {
          // si le node est une trend
          trends.push(Number((node as Trend).parameter));
        }
        if (node.type == 'graph') {
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

  private advanceTimer(timer: Timer, t: number, triggeredEvents: Trigger[]) {
    timer.counter++;
    if (timer.counter == timer.duration) {
      triggeredEvents.push(
        new Trigger({ time: t, id: timer.id, editable: false })
      );
      timer.state = false; // the timer end
    }
  }

  private setAllNodesStatesToFalse(graph: Graph) {
    graph.nodes.forEach((node) => {
      node.state = false;
      if (node.type == NodeType.graph)
        this.setAllNodesStatesToFalse(node as Graph);
    });
  }

  // Standard Normal variate using Box-Muller transform.
  private gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }

  getNodeByID(id: string, graph: Graph): Node {
    let result = undefined;
    graph.nodes.forEach((node: Node) => {
      if (node.id == id) result = node;
    });
    return result;
  }
}
