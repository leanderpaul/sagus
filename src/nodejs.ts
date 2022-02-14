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

export default { compareHash, decrypt, encrypt, genAutoID, genRandom, genUID, genUUID, hash, resetAutoID };
