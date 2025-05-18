export function pushUnique(arr: Array<string>, str: string): Array<string> {
  if (!arr.includes(str)) {
    arr.push(str);
  }
  return arr;
}
