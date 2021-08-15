/**
 * Importing npm packages.
 */
import os from 'os';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { v1 } from 'uuid';

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */

/**
 * Declaring the constants.
 */
const pid = process.pid.toString(36);
let mac = '';
let lastTime = 0;
let autoIDGenerators: Record<string | number, Generator<number, number, undefined>> = {};

if (process?.pid) {
  const netInterfaces = os.networkInterfaces();
  loop: for (let interfaceKey in netInterfaces) {
    const netInterface = netInterfaces[interfaceKey]!;
    for (let index = 0; index < netInterface.length; index++) {
      const macAddr = netInterface[index]?.mac;
      if (macAddr && macAddr != '00:00:00:00:00:00') {
        mac = parseInt(macAddr.replace(/\:|\D+/gi, '')).toString(36);
        break loop;
      }
    }
  }
}

/**
 * Gets the current time and ensures that it is different from the previous time and return it.
 *
 * @returns time
 */
function getUniqueTime() {
  const time = Date.now();
  const last = lastTime || time;
  return (lastTime = time > last ? time : last + 1);
}

function* autoIDGenerator(): Generator<number, number, undefined> {
  let id = 0;
  while (true) {
    yield id++;
  }
}

/**
 * Generates a globally unique identifier based on RFC4122 version 1
 *
 * @returns UUID
 */
export function genUUID() {
  return v1();
}

/**
 * Generates a unique ID using time, process and mac address.
 *
 * @param prefix The prefix string before the unique ID
 * @param suffix The suffic string after the unique ID
 * @returns unique ID
 */
export function genUID(prefix = '', suffix = '') {
  return prefix + mac + pid + getUniqueTime().toString(36) + suffix;
}

/**
 * Generates a incremental unique ID for each namespace
 *
 * @param namespace The auto ID namespace
 * @returns a unique ID in the namespace incrementaly
 */
export function genAutoID(namespace: string | number = '') {
  let generator = autoIDGenerators[namespace];
  if (generator === undefined) {
    generator = autoIDGenerator();
    autoIDGenerators[namespace] = generator;
  }
  return generator.next().value;
}

/**
 * Resets the counter of the namespace.
 *
 * @param namespace The auto ID namespace
 */
export function resetAutoID(namespace: string | number = '') {
  if (autoIDGenerators[namespace]) delete autoIDGenerators[namespace];
}

/**
 * Generates a random string.
 *
 * @param size The number of bytes to be generated
 * @param encoding The string encoding to be returned
 * @returns Random string
 */
export function genRandom(size = 32, encoding: BufferEncoding = 'hex') {
  return crypto.randomBytes(size).toString(encoding);
}

/**
 * Hashes the string provided.
 *
 * @param str The string to be hashed
 * @param salt The cost of processing the data
 * @returns Hashed string
 */
export function hash(str: string, salt = 10) {
  return bcrypt.hash(str, salt);
}

/**
 * Compares whether a string matches with the hashed string.
 *
 * @param str The string to compare
 * @param hashedStr The hash string that is to be compared with
 * @returns Whether string matches or not
 */
export function compareHash(str: string, hashedStr: string) {
  return bcrypt.compare(str, hashedStr);
}

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
 * Encrypts the data with the secret key.
 *
 * @param data The data to be encrypted
 * @param secretKey The secret key that is used to encrypt the data. **Ensure that the length of the secret key is 32 Bytes otherwise error will be thrown**
 * @returns The iv and the encrypted data
 */
export function encrypt<T>(data: T, secretKey: string | Buffer) {
  const str = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
  const encryptedData = Buffer.concat([cipher.update(str), cipher.final()]);
  return { iv: iv.toString('base64'), encryptedData: encryptedData.toString('base64') };
}

/**
 * Decrypts the data using the secret key and iv.
 *
 * @param encryptedData The encrypted data
 * @param secretKey The secret key that is used to decrypt the data. **Ensure that the length of the secret key is 32 Bytes otherwise error will be thrown**
 * @param iv The Initialization vector
 * @returns The decrypted data
 */
export function decrypt<T = any>(result: { iv: string; encryptedData: string }, secretKey: string | Buffer): T {
  const ivBuffer = Buffer.from(result.iv, 'base64');
  const enDataBuffer = Buffer.from(result.encryptedData, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, ivBuffer);
  const dataBuffer = Buffer.concat([decipher.update(enDataBuffer), decipher.final()]);
  return JSON.parse(dataBuffer.toString());
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

export default { genUID, genUUID, genAutoID, resetAutoID, genRandom, hash, compareHash, encode, decode, encrypt, decrypt, trimObject, pickKeys, removeKeys, isValid, isValidObject, iterate };
