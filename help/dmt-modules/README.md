## DMT MIDDLEWARE and MODULES

**DMT MODULES** are directories inside `~/.dmt/core/node`, for example:

```
common
controller
search
player
notify
...
```

Some of them are also **middleware**. The difference is:

- middleware module exports a special `init` function which accepts dmt `program` instance
- middleware is manually listed in `dmt-proc.js` file which instructs the dmt process to load it at boot time
- modules that are not middleware are _not loaded_ into `dmt process` in this way but are rather libraries of useful functions to be used from other modules

## Middleware loading

Middleware is loaded inside `dmt-proc.js` (`~/.dmt/core/node/controller/daemons/dmt-proc.js`):

```javascript
import dmt from 'dmt/bridge';
const { log } = dmt;

import program from '../program/program';

const mids = ['mid1', 'mid2', 'mid3'] // LIST MIDDLEWARE TO BE LOADED HERE

try {
  program({ mids });
} catch (e) {
  log.magenta('⚠️  GENERAL ERROR ⚠️');
  log.red(e);
}
```

In this example we would load

```
~/.dmt/core/node/mid1
~/.dmt/core/node/mid2
~/.dmt/core/node/mid3
```

💡 Each middleware that is loaded can also be removed from `dmt-proc.js` file and `dmt process` should continue functioning without any issues with that functionality provided by that particular module functionality missing. This makes for very modular approach which makes code clean, very well structures and also makes for easy debugging.

## Middleware init function

Entrypoint is named function `init(program) ` exported from `index.js`, for example `~/.dmt/core/node/mid1/index.js`:

```js
function init(program) {
  ...
}

export { init };
```

`init` function is passed a `program` instance upon loading.

