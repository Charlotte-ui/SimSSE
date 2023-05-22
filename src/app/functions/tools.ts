


export function deleteElementFromArray (array:any[],element:any) {
    const index = array.indexOf(element);
    if (index > -1) array.splice(index, 1);
}