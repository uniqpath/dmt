
# browser-util-inspect

This module contains minor modifications to the 
[original by Automattic](https://github.com/Automattic/util-inspect). It
disregards legacy platform support and has zero dependencies, making it much
lower weight.

This is an extraction of Node's `inspect` utility from the `util`
module, with two fundamental advantages:

- Single, focused module
- Ready for use in-browser

## How to use

With some kind of module bundler (webpack, etc):

```js
import inspect from 'browser-util-inspect';
console.log(inspect({}));
```

## License

MIT – Copyright (c) 2010-2014 Joyent, Inc.
