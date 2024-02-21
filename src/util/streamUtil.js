export function listToMap(list = [], key) {
  const map = new Map();
  for (const item of list) {
    map.set(item[key], item);
  }
  return map;
}
