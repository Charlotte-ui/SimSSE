import { Graph, NodeType, Event, Node } from "../models/vertex/node";



export function deleteElementFromArray (array:any[],element:any) {
    const index = array.indexOf(element);
    if (index > -1) array.splice(index, 1);
}


export function getElementByChamp<T>(array:T[],champ:string,value:any) : T|undefined {
    let resArray = array.filter((element:T) => element[champ] == value) ;
    let res = resArray.length > 0 ?  resArray[0] :  undefined;
    return res;
}


/**
   * get a node by his id, looking recursivly 
   * @param graph 
   * @param id 
   * @returns 
   */
  export function getNodeByID(graph:Graph, id: string): Node {
    let result = undefined;
    console.log(Array.isArray(graph.nodes))
        console.log(graph)

    graph.nodes.forEach((node) => {
      // event are identified by evnt

      if (node.type == NodeType.event && (node as Event).event == id)
        result = node;
      else if (node.id == id) result = node;
      else if (node.type == NodeType.graph) result = getNodeByID(node as Graph,id)
    });
    return result;
  }
