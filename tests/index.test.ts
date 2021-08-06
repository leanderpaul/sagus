import sagus from '../src/index';

const UUID_REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
const BASE64_REGEX = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/;

describe('genUID()', function () {
  it('should only contain alphanumerics and have 8 - 18 characters', function () {
    const uid = sagus.genUID();
    expect(uid).toMatch(/^[a-z0-9]{8,18}$/);
  });

  it('should have a prefix before the unique ID when prefix is given', function () {
    const uid = sagus.genUID('prefix-');
    expect(uid).toMatch(/^prefix\-[a-z0-9]{8,18}$/);
  });

  it('should have a suffix after the unique ID when suffix is given', function () {
    const uid = sagus.genUID(undefined, '-suffix');
    expect(uid).toMatch(/^[a-z0-9]{8,18}\-suffix$/);
  });

  it('should have both prefix and suffix before and after the unique ID when both prefix and suffix is given', function () {
    const uid = sagus.genUID('prefix-', '-suffix');
    expect(uid).toMatch(/^prefix\-[a-z0-9]{8,18}\-suffix$/);
  });

  it('should be unique', function () {
    const uid1 = sagus.genUID();
    const uid2 = sagus.genUID();
    expect(uid1).not.toBe(uid2);
  });
});

describe('genUUID()', function () {
  it('should have be RFC4122 UUID', function () {
    const uuid = sagus.genUUID();
    expect(uuid).toMatch(UUID_REGEX);
  });

  it('should be unique', function () {
    const uuid1 = sagus.genUUID();
    const uuid2 = sagus.genUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});

describe('genRandom()', function () {
  it('should generate random hex of size 32', function () {
    const str = sagus.genRandom();
    expect(str).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should generate random base64 string of size 32', function () {
    const str = sagus.genRandom(undefined, 'base64');
    expect(str).toMatch(BASE64_REGEX);
    expect(str).toHaveLength(44);
  });

  it('should generate random hex of size 16', function () {
    const str = sagus.genRandom(16);
    expect(str).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should generate random base64 of size 16', function () {
    const str = sagus.genRandom(16, 'base64');
    expect(str).toMatch(BASE64_REGEX);
    expect(str).toHaveLength(24);
  });
});

describe('hash()', function () {
  it('should hash the string with 10 rounds', async function () {
    const hashedStr = await sagus.hash('Hello, World');
    expect(hashedStr).toMatch(/^\$2b\$10\$/);
    expect(hashedStr).toHaveLength(60);
  });

  it('should hash the string with 8 rounds', async function () {
    const hashedStr = await sagus.hash('Hello, World', 8);
    expect(hashedStr).toMatch(/^\$2b\$08\$/);
    expect(hashedStr).toHaveLength(60);
  });

  it('should have different values when hasing same string', async function () {
    const str = 'Hello, World';
    const hashedStr1 = await sagus.hash(str);
    const hashedStr2 = await sagus.hash(str);
    expect(hashedStr1).not.toBe(hashedStr2);
  });
});

describe('compareHash()', function () {
  it('should return true for same string and hash', async function () {
    const str = 'Hello, World';
    const hashedStr = await sagus.hash(str);
    const isValid = await sagus.compareHash(str, hashedStr);
    expect(isValid).toBe(true);
  });

  it('should return false for different string and hash', async function () {
    const str = 'Hello, World';
    const hashedStr = await sagus.hash(str);
    const isValid = await sagus.compareHash(str + ' ', hashedStr);
    expect(isValid).toBe(false);
  });

  it('should return true even comparing same string with different hashes of same stirng', async function () {
    const str = 'Hello, World';
    const hashedStr1 = await sagus.hash(str);
    const hashedStr2 = await sagus.hash(str);
    const isValid1 = await sagus.compareHash(str, hashedStr1);
    const isValid2 = await sagus.compareHash(str, hashedStr2);
    expect(hashedStr1).not.toBe(hashedStr2);
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });
});

describe('encode() and decode()', function () {
  const str = 'Hello, World';
  const data = { name: 'John Doe' };
  let encodedData = '';

  it('should encode string to hex', function () {
    encodedData = sagus.encode(str, 'hex');
    expect(encodedData).toMatch(/^[0-9a-f]{3,}$/);
  });

  it('should decode hex to string', function () {
    const decodedData = sagus.decode(encodedData, 'hex');
    expect(decodedData).toBe(str);
  });

  it('should encode object to base64', function () {
    encodedData = sagus.encode(data);
    expect(encodedData).toMatch(BASE64_REGEX);
  });

  it('should decode base64 to object', function () {
    const decodedData = sagus.decode(encodedData);
    expect(decodedData).toStrictEqual(data);
  });
});

describe('encrypt() and decrypt', function () {
  const str = 'Hello, World';
  const data = { name: 'John Doe', age: 40, gender: 'Male' };
  const secretKey = 'bgW7Hekl97HFrwdhkj67hr67nh978GHH';
  let result = { iv: '', encryptedData: '' };

  it(`should encrypt '${str}'`, function () {
    result = sagus.encrypt(str, secretKey);
    expect(result).toHaveProperty('iv');
    expect(result.iv).toMatch(BASE64_REGEX);
    expect(result).toHaveProperty('encryptedData');
    expect(result.encryptedData).toMatch(BASE64_REGEX);
  });

  it(`should decrypt to get '${str}'`, function () {
    const decryptedStr = sagus.decrypt(result, secretKey);
    expect(decryptedStr).toBe(str);
  });

  it(`should encrypt ${JSON.stringify(data)}`, function () {
    result = sagus.encrypt(data, secretKey);
    expect(result).toHaveProperty('iv');
    expect(result.iv).toMatch(BASE64_REGEX);
    expect(result).toHaveProperty('encryptedData');
    expect(result.encryptedData).toMatch(BASE64_REGEX);
  });

  it(`should decrypt to get ${JSON.stringify(data)}`, function () {
    const decryptedStr = sagus.decrypt(result, secretKey);
    expect(decryptedStr).toStrictEqual(data);
  });
});

describe('trimObject()', function () {
  it('should remove null and undefined values from object', function () {
    const obj = { name: 'John Doe', age: undefined, gender: null };
    const result = sagus.trimObject(obj);
    expect(result).toStrictEqual({ name: 'John Doe' });
  });

  it('should remove empty string values from object', function () {
    const obj = { name: 'John Doe', gender: '' };
    const result = sagus.trimObject(obj);
    expect(result).toStrictEqual({ name: 'John Doe' });
  });

  it('should not remove false values from object', function () {
    const obj = { name: 'John Doe', isFemale: false };
    const result = sagus.trimObject(obj);
    expect(result).toStrictEqual(obj);
  });

  it('should remove empty string and undefined from nested object', function () {
    const obj = { name: 'John Doe', gender: '', body: { height: undefined, weight: '20kg', bloodGroup: '' } };
    const result = sagus.trimObject(obj);
    expect(result).toStrictEqual({ name: 'John Doe', body: { weight: '20kg' } });
  });
});

describe('pickKeys()', function () {
  const obj = { name: 'John Doe', age: 40, gender: 'Male' };

  it(`should only get 'name' from object`, function () {
    const result = sagus.pickKeys(obj, ['name']);
    expect(result).toStrictEqual({ name: obj.name });
  });

  it(`should get 'name' and 'age' from object`, function () {
    const result = sagus.pickKeys(obj, ['name', 'age']);
    expect(result).toStrictEqual({ name: obj.name, age: obj.age });
  });
});

describe('removeKeys()', function () {
  const obj = { name: 'John Doe', age: 40, gender: 'Male' };

  it(`should only remove 'name' from object`, function () {
    const result = sagus.removeKeys(obj, ['name']);
    expect(result).toStrictEqual({ age: obj.age, gender: obj.gender });
  });

  it(`should remove 'username' and 'password' from object`, function () {
    const result = sagus.removeKeys(obj, ['name', 'gender']);
    expect(result).toStrictEqual({ age: obj.age });
  });
});

describe('isValid()', function () {
  it('should return false for null', function () {
    expect(sagus.isValid(null)).toBe(false);
  });

  it('should return false for undefined', function () {
    expect(sagus.isValid(undefined)).toBe(false);
  });

  it('should return false for NaN', function () {
    expect(sagus.isValid(NaN)).toBe(false);
  });

  it('should return false for empty string', function () {
    expect(sagus.isValid('')).toBe(false);
  });

  it(`should return true for 'false' boolean`, function () {
    expect(sagus.isValid(false)).toBe(true);
  });

  it('should return true for empty object', function () {
    expect(sagus.isValid({})).toBe(true);
  });

  it('should return true for empty array', function () {
    expect(sagus.isValid([])).toBe(true);
  });
});

describe('isValidObject()', function () {
  it('should return false for null', function () {
    expect(sagus.isValidObject(null)).toBe(false);
  });

  it('should return false for undefined', function () {
    expect(sagus.isValidObject(undefined)).toBe(false);
  });

  it('should return false for NaN', function () {
    expect(sagus.isValidObject(NaN)).toBe(false);
  });

  it('should return false for empty string', function () {
    expect(sagus.isValidObject('')).toBe(false);
  });

  it(`should return true for 'false' boolean`, function () {
    expect(sagus.isValidObject(false)).toBe(true);
  });

  it('should return false for empty object', function () {
    expect(sagus.isValidObject({})).toBe(false);
  });

  it('should return false for empty array', function () {
    expect(sagus.isValidObject([])).toBe(false);
  });

  it('should return true for object with name undefined', function () {
    expect(sagus.isValidObject({ name: undefined })).toBe(true);
  });

  it('should return true for array with member undefined', function () {
    expect(sagus.isValidObject([undefined])).toBe(true);
  });
});
