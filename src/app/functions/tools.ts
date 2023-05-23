


export function deleteElementFromArray (array:any[],element:any) {
    const index = array.indexOf(element);
    if (index > -1) array.splice(index, 1);
}


export function getElementByChamp<T>(array:T[],champ:string,value:any) : T|undefined {
    let resArray = array.filter((element:T) => element[champ] == value) ;
    let res = resArray.length > 0 ?  resArray[0] :  undefined;
    return res;
}
