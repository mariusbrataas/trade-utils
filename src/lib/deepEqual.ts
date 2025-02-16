export function deepEqual<T>(obj1: T, obj2: T): boolean {
  // Check if both are the same reference or primitive values
  if (obj1 === obj2) return true;

  // Check if either is null or not an object (i.e., primitive values)
  if (
    obj1 == null ||
    typeof obj1 !== 'object' ||
    obj2 == null ||
    typeof obj2 !== 'object'
  ) {
    return false;
  }

  // Check if both have the same number of keys
  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;
  if (keys1.length !== keys2.length) return false;

  // Recursively check each key and value in both objects
  for (const key of keys1) {
    // Ensure obj2 has the key and both values are deeply equal
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
