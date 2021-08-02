# encoding-negotiator
## Install

![Build Status](https://github.com/SerayaEryn/encoding-negotiator/workflows/ci/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/SerayaEryn/encoding-negotiator/badge.svg?branch=master)](https://coveralls.io/github/SerayaEryn/encoding-negotiator?branch=master)
[![NPM version](https://img.shields.io/npm/v/encoding-negotiator.svg?style=flat)](https://www.npmjs.com/package/encoding-negotiator)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/SerayaEryn/encoding-negotiator.svg)](https://greenkeeper.io/)

```
npm install encoding-negotiator
```
## Example
```js
const encodingNegotiator = require('encoding-negotiator');

encodingNegotiator.negotiate({
  header: 'compress;q=0.5, gzip;q=1.0',
  supportedEncodings: ['gzip', 'deflate', 'identity']
); //returns gzip
```
## API
### negotiate(header, supported)
Returns the most preffered encoding available in `supportedEncodings` The first 
element of the `supportedEncodings` array will be used in case of an asterisk.


#### header

The `accept-encoding` header.

#### supportedEncodings

An array of the supported encodings.

##### prefferedEncoding (optional)

An encoding preffered by the server if the client sends multiple encodings no 
quality value (for example `Accept-Encoding: gzip, deflate, br`).

## Benchmark

```
$ node benchmark/benchmark.js 
negotiator x 260,201 ops/sec ±0.64% (88 runs sampled)
encoding-negotiator x 434,196 ops/sec ±1.23% (88 runs sampled)
Fastest is encoding-negotiator
```

## License

[MIT](./LICENSE)