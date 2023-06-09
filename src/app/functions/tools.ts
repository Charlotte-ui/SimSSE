import { number } from 'echarts';
import { Graph, NodeType, Event, Node, Link } from '../models/vertex/node';
import { Vertex } from '../models/vertex/vertex';

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

export function getElementByChampMap<T>(
  map: Map<string, T>,
  champ: string,
  value: any
): T | undefined {
  let resMap = new Map(
    [...map].filter(([key, element]) => element[champ] == value)
  );
  let res = resMap.size > 0 ? map.entries().next().value : undefined;
  return res;
}

/**
 * return a map of the element of map1 that are not include in map2
 * @param map1
 * @param map1
 */
export function differenceMaps<T extends Vertex>(map1: Map<string, T>, map2: Map<string, T>) {
  return new Map(
    [...map1].filter(([key, element]) => !map2.get(element.id))
  );
}

/**
 * get a node by his id, looking recursivly
 * @param graph
 * @param id
 * @returns
 */
export function getNodeByID(graph: Graph, id: string): Node {
  for (let [key, node] of graph.nodes) {
    // event are identified by evnt
    if (node.type == NodeType.event && (node as Event).event == id) return node;
    else if (key == id) return node;
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
  let link = graph.links.get(id);
  if (link) return link;
  for (let [string, node] of graph.nodes) {
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

export function isMapDeepEqual(
  map1: Map<string, any>,
  map2: Map<string, any>
): boolean {
  if (map1.size !== map2.size) return false;

  let keys = Array.from(map1.keys());

  for (let i in keys) {
    const value1 = map1.get(keys[i]);
    const value2 = map2.get(keys[i]);

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
export function shade(color, light) {
  let [r, g, b] = hexToRgb(color);

  if (light < 0) {
    r = (1 + light) * r;
    g = (1 + light) * g;
    b = (1 + light) * b;
  } else {
    r = (1 - light) * r + light * 255;
    g = (1 - light) * g + light * 255;
    b = (1 - light) * b + light * 255;
  }
  return rgbToHex(r, g, b);
}

function hexToRgb(color: string): [number, number, number] {
  var r = parseInt(color.substr(1, 2), 16);
  var g = parseInt(color.substr(3, 2), 16);
  var b = parseInt(color.substr(5, 2), 16);
  return [r, g, b];
}

function hex2(c) {
  c = Math.round(c);
  if (c < 0) c = 0;
  if (c > 255) c = 255;

  var s = c.toString(16);
  if (s.length < 2) s = '0' + s;
  return s;
}

function rgbToHex(r, g, b) {
  return '#' + hex2(r) + hex2(g) + hex2(b);
}

export function colorContrast(color: string) {
  let [r, g, b] = hexToRgb(color);

  if (r * 0.299 + g * 0.587 + b * 0.114 > 186) return '#000000';
  else return '#ffffff';
}
