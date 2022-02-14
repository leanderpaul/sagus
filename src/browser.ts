/**
 * Importing npm packages.
 */

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */

/**
 * Declaring the constants.
 */

/**
 * Encodes the data.
 *
 * @param data The data to be encoded
 * @param encoding The encoding to be used to encode the data
 * @returns Encoded string
 */
export function encode<T>(data: T, encoding: BufferEncoding = 'base64') {
  const str = JSON.stringify(data);
  return Buffer.from(str).toString(encoding);
}

/**
 * Decodes the encoded string.
 *
 * @param str The encoded string
 * @param encoding The encoding to be used to decode the data
 * @returns Decoded data
 */
export function decode<T = any>(str: string, encoding: BufferEncoding = 'base64'): T {
  const data = Buffer.from(str, encoding);
  return JSON.parse(data.toString());
}

/**
 * Removes those fields in the object that do not have a valid input.
 *
 * @param obj The object to be trimmed.
 */
export function trimObject<T extends object>(obj: T): T {
  const keys = Object.keys(obj) as (keyof T)[];
  const newObj: any = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]!;
    let value: any = obj[key];
    if (isValid(value)) {
      if (typeof value === 'object' && !Array.isArray(value)) newObj[key] = trimObject(value);
      else newObj[key] = value;
    }
  }
  return newObj;
}

/**
 * Returns a new object with the needed fields.
 *
 * @param obj The orginal object.
 * @param keys The keys to be picked from the object.
 */
export function pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const newObj: any = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]!;
    newObj[key] = obj[key];
  }
  return newObj;
}

/**
 * Return a new object after removing the unneeded keys from the orginal object.
 *
 * @param obj The orginal object.
 * @param keys The keys to be removed from the object.
 */
export function removeKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const newObj: any = {};
  const allKeys = Object.keys(obj) as K[];
  for (let index = 0; index < allKeys.length; index++) {
    const key = allKeys[index]!;
    if (!keys.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

/**
 * Validates the object.
 *
 * @param value Any object or type
 * @returns Whether the object is valid or not
 */
export function isValid<T>(value: T): value is NonNullable<T> {
  if (value === undefined || value === null) return false;
  else if (typeof value === 'string') return !(value.trim() === '');
  else if (typeof value === 'number' && isNaN(value)) return false;
  return true;
}

/**
 * Validates the object.
 *
 * @param obj any object
 * @returns Whether an object is valid and has valid data in it
 */
export function isValidObject<T>(obj: T): obj is NonNullable<T> {
  const valid = isValid(obj);
  if (valid === false) return false;
  if (Array.isArray(obj)) return obj.length > 0;
  else if (typeof obj === 'object') return Object.keys(obj).length > 0;
  return true;
}

/**
 * Creates an iterator for the input.
 *
 * @param input the object or array that needs to be iterated
 * @returns a generator function that iterates the input provided
 */
export function* iterate<T extends object, K extends keyof T>(input: T): Generator<{ key: K; value: T[K] }, { key: K; value: T[K] }> {
  if (Array.isArray(input)) {
    for (let index = 0; index < input.length - 1; index++) {
      yield { key: index as K, value: input[index] as T[K] };
    }
    const lastIndex = input.length - 1;
    return { key: lastIndex as K, value: input[lastIndex]! };
  }
  const entries = Object.entries(input);
  for (let index = 0; index < entries.length - 1; index++) {
    const [key, value] = entries[index]!;
    yield { key: key as K, value };
  }
  const lastIndex = entries.length - 1;
  const [key, value] = entries[lastIndex]!;
  return { key: key as K, value };
}

export default { decode, encode, isValid, isValidObject, iterate, pickKeys, removeKeys, trimObject };
