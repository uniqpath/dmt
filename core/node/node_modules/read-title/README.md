# read-title

> read any web page's title.

## Install

```
$ npm install --save read-title
```


## Usage

```js
const readTitle = require('read-title');

readTitle('https://www.npmjs.com/package/read-title').then(
  title => console.log(title),
  err => console.error(err)
);
```


## Related

- [`cheerio`](https://www.npmjs.com/package/cheerio) - Tiny, fast, and elegant implementation of core jQuery designed specifically for the server.
- [`fetch-promise`](https://www.npmjs.com/package/fetch-promise) - Fetch URL contents By Promise.

## License

The MIT License (MIT)

Copyright (c) 2015 - 2016