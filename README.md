<!-- [![Build Status](https://travis-ci.org/scottinet/fast-deepclone.svg?branch=master)](https://travis-ci.org/scottinet/fast-deepclone) -->

# correct-clone-nodejs

Correct Node.js object cloning, with support for a wide range of data types.

## Behavior

Cloning a value will return an identical copy of the original value, and any of its nested values.

Here are some of the supported capabilities:

- Clones any value passed in, not just Objects.
- Recursively clones deeply nested items contained in Arrays, Objects, TypedArrays, Maps, and Sets.
- Retains prototypes, to support inheritance from anything, and to preserve methods available to cloned instances.
- Clones many standard Node.js data types, including:
  - Array
  - Buffer
  - DataView
  - Map
  - Number (primitives and objects)
  - Object
  - RegExp
  - Set
  - String (primitives and objects)
  - TypedArray implementations
- Tested on Node v8.x

## Installation

This module can only be used in a Node.js environment.

### NPM

`npm install correct-clone-nodejs --save --save-exact`

### Yarn

`yarn add correct-clone-nodejs --exact`


## How to use

```js
const correctClone = require('correct-clone-nodejs');

/*
  Deep clone anything.
  Modifying anything in the original data structure will not affect the cloned data structure.
 */
const clonedTarget = correctClone(source);
```

## When to use this module

This module is written in C++, using V8 for faster object access.  

This module aims to be the most correct deep-cloning module currently available, but it can only be used in a Node.js environment.

If you need a correct deep-cloning tool in browsers, that can support DOM objects, you may need to write your own tool.

If you need something fast and are willing to trade off correctness, please see [this project for a comparison of different cloning libraries available on NPM](https://laurence-myers.github.io/clone-comparison-nodejs/). It runs a standard test suite against each library, and provides a feature table to compare capabilities.

## License

[MIT](https://opensource.org/licenses/MIT)
