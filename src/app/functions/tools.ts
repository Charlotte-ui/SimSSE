import { number } from 'echarts';
import { Graph, NodeType, Event, Node, Link } from '../models/vertex/node';

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

/**
 * get a link by his id, looking recursivly
 * @param graph
 * @param id
 * @returns
 */
export function getLinkByID(graph: Graph, id: string): Link {
  console.log('getLinkByID ', graph);
  let link = getElementByChamp<Link>(graph.links, 'id', id);
  if (link) return link;
  for (let node of graph.nodes) {
    if (node.type == NodeType.graph) {
      let deepLink = getLinkByID(node as Graph, id);
      if (deepLink) return deepLink;
    }
  }
  return undefined;
}

export function roundingWithDecimal(value: number, decimals: number): number {
  let a = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * a) / a;
}

export function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export function orderBy<T>(array: T[], champ): T[] {
  return array.sort((n1, n2) => {
    if (n1[champ] > n2[champ]) {
      return 1;
    }

    if (n1[champ] < n2[champ]) {
      return -1;
    }

    return 0;
  });
}
export function isDeepEqual(object1, object2): boolean {
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if (
      (isObjects && !isDeepEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false;
    }
  }
  return true;
}

const isObject = (object) => {
  return object != null && typeof object === 'object';
};

export function remove<T>(array: T[], element: T) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}

/**
 * darken or ligthen color
 * @param pourcentage
 * @param color
 * @returns
 */
export function shade(col, light) {
    var r = parseInt(col.substr(1, 2), 16);
    var g = parseInt(col.substr(3, 2), 16);
    var b = parseInt(col.substr(5, 2), 16);

    if (light < 0) {
        r = (1 + light) * r;
        g = (1 + light) * g;
        b = (1 + light) * b;
    } else {
        r = (1 - light) * r + light * 255;
        g = (1 - light) * g + light * 255;
        b = (1 - light) * b + light * 255;
    }
    return color(r, g, b);
}



function hex2(c) {
    c = Math.round(c);
    if (c < 0) c = 0;
    if (c > 255) c = 255;

    var s = c.toString(16);
    if (s.length < 2) s = "0" + s;
    return s;
}

function color(r, g, b) {
    return "#" + hex2(r) + hex2(g) + hex2(b);
}


