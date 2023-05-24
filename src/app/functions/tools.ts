import { number } from 'echarts';
import { Graph, NodeType, Event, Node } from '../models/vertex/node';

export function deleteElementFromArray(array: any[], element: any) {
  const index = array.indexOf(element);
  if (index > -1) array.splice(index, 1);
}

export function pushWithoutDuplicateByChamp<T>(
  array: T[],
  element: T,
  champ: string
) {
  return array
    .filter((arrayElem: T) => arrayElem[champ] !== element[champ])
    .concat([element]);
}

export function getElementByChamp<T>(
  array: T[],
  champ: string,
  value: any
): T | undefined {
  let resArray = array.filter((element: T) => element[champ] == value);
  let res = resArray.length > 0 ? resArray[0] : undefined;
  return res;
}

/**
 * get a node by his id, looking recursivly
 * @param graph
 * @param id
 * @returns
 */
export function getNodeByID(graph: Graph, id: string): Node {
  for (let node of graph.nodes) {
    // event are identified by evnt
    if (node.type == NodeType.event && (node as Event).event == id) return node;
    else if (node.id == id) return node;
    else if (node.type == NodeType.graph) {
      let deepNode = getNodeByID(node as Graph, id);
      if (deepNode) return deepNode;
    }
  }
  return undefined;
}

export function roundingWithDecimal(value: number, decimals: number): number {
  let a = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * a) / a;
}


export function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}