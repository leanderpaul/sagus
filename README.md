[![Sagus Logo](https://i.ibb.co/ZVPfqRf/Sagus.png)](https://github.com/leanderpaul/sagus)

[![NPM Version](https://img.shields.io/npm/v/sagus?style=for-the-badge)](https://www.npmjs.com/package/sagus)
[![Build Status](https://img.shields.io/github/workflow/status/leanderpaul/sagus/ci-cd?style=for-the-badge)](https://github.com/leanderpaul/sagus/actions/workflows/ci-cd.yml)

A Typescript helper library

## Install

```bash
$ npm install sagus
```

## Usage

### sagus.genUUID()

Generates a RFC4122 version 1 UUID.

Example:

```js
import sagus from 'sagus';

sagus.genUUID();
// => '74db8250-f6ad-11eb-bcfe-7d80d5a32604'
```

### sagus.genUID([prefix[, sufix]])

Generates a unique ID using the time, process and mac address.

Example:

```js
sagus.genUID();
// => '2kabh61y04ks0asvvp'

sagus.genUID('prefix-');
// => 'prefix-2kabh61y04ks0asvvp'

sagus.genUID('', '-suffix');
// => '2kabh61y04ks0asvvp-suffix'

sagus.genUID('prefix-', '-suffix');
// => 'prefix-2kabh61y04ks0asvvp-suffix'
```

### sagus.genRandom([size[, encoding]])

Generates a random bytes of data in the encoding needed.

Example:

```js
sagus.genRandom();
// => 'e58953b1068efba6367593a7392c56d179ac3ff0212c14bc0e24f5133dd1a411'

sagus.genRandom(4);
// => '630e0b2a'

sagus.genRandom(4, 'base64');
// => 'RofCEQ=='
```

### sagus.hash(str[, salt])

Asynchronously generates a hash for the given string.

Example:

```js
sagus.hash('password').then((hashedStr) => {
  // hashedStr = '$2b$10$bb2gOp7GY7oXgljPwskaAuhdxM3HMrV7dBbawFjb9phvSFZOJ4MSK'
});

sagus.hash('password', 8).then((hashedStr) => {
  // hashedStr = '$2b$08$mONvULNP4hN1ky4AMbxY4.1jIRFUYLrsxNfselWWaYJ9POwqh1Qbe'
});
```

### sagus.compareHash(str, hashedStr)

Asynchronously compares the string and the hash.

Example:

```js
sagus.compareHash('password', hashedStr).then((res) => {
  // res = true
});

sagus.compareHash('not-password', hashedStr).then((res) => {
  // res = false
});
```

### sagus.encode(data[, encoding])

Encodes the data in the format that is needed.

Example:

```js
const encoded = sagus.encode({ greet: 'Hello, World !' });
// => 'eyJncmVldCI6IkhlbGxvLCBXb3JsZCAhIn0='

const encodedHex = sagus.encode({ greet: 'Hello, World !' }, 'hex');
// => '7b226772656574223a2248656c6c6f2c20576f726c642021227d'
```

### sagus.decode(data[, encoding])

Decodes the encoded data from the specified format.

Example:

```js
sagus.decode('eyJncmVldCI6IkhlbGxvLCBXb3JsZCAhIn0=');
// => { greet: 'Hello, World !' }

sagus.decode('7b226772656574223a2248656c6c6f2c20576f726c642021227d', 'hex');
// => { greet: 'Hello, World !' }
```

### sagus.encrypt(data, secretKey)

Encrypts the data using the secret key and returns an initialization vector and encrypted data.

**The Secret key must have exactly 32 bytes**

Example:

```js
const secretKey = 'xxxxxx 32 byte secret key xxxxxx';
const result = sagus.encrypt('secret data', secretKey);
// => { iv: 'N6pI0p0UKG1PdAYx8AtOzw==', encryptedData: 'b+oggS9U9tyk/Uyqhw==' }
```

### sagus.decrypt(result, secretKey)

Decrypts the encrypted data using the secret key and initialization vector and return the original data.

**The Secret key must have exactly 32 bytes**

Example:

```js
const secretKey = 'xxxxxx 32 byte secret key xxxxxx';
const data = sagus.decrypt(result, secretKey);
// => 'secret data'
```

### sagus.trimObject(obj)

Trims and removes invalid fields from the object.

Example:

```js
let obj = { name: 'Danny Joe', age: undefined, gender: '', dob: null };
sagus.trimObject(obj);
// => { name: 'Danny Joe' }

obj = { name: 'Diana', isMale: false, children: {} };
sagus.trimObject(obj);
// => { name: 'Diana', isMale: false, children: {} }
```

### sagus.pickKeys(obj, keys)

Returns a new object with only the keys selected. This method is type safe and the returned object will have the correct types.

Example:

```js
const obj = { name: 'John Doe', age: 40, gender: 'male' };
const newObj = sagus.pickKeys(obj, ['name', 'age']);
// => { name: 'John Doe', age: 40 }
```

### sagus.removeKeys(obj, keys)

Returns a new object with the keys selected removed from the original object. This method is type safe and the returned object will have the correct types.

```js
const newObj = sagus.removeKeys(obj, ['age']);
// => { name: 'John Doe', gender: 'male' }
```

### sagus.isValid(value)

Checks whether the provied value is valid or not.

Example:

```js
sagus.isValid('Hello'); // => true
sagus.isValid(''); // => false
sagus.isValid(false); // => true
sagus.isValid(undefined); // => false
sagus.isValid(null); // => false
sagus.isValid(NaN); // => false
sagus.isValid({}); // => true
sagus.isValid([]); // => true
```

### sagus.isValidObject(obj)

Checks whether the provied value is valid or not and also validates that objects are not empty.

Example:

```js
// same as the above example for all cases except the last two
sagus.isValidObject({}); // => false
sagus.isValidObject([]); // => false
sagus.isValidObject({ name: 'John Doe' }); // => true
sagus.isValidObject({ name: '' }); // => true
sagus.isValidObject(['hello']); // => true
sagus.isValidObject([undefined]); // => true
```
