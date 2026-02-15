## DMT USER ENGINE · Device-specific Code Snippets

DMT USER ENGINE is a collection JavaScript code that resides in `~/.dmt/user/engine` directory. It also has its own `node_modules`.

Entrypoint is `~/.dmt/user/engine/index.js` and is executed on every device.  

```js
import { log } from 'dmt/common';

export function init(program) {
  log.cyan('Hi from DMT USER ENGINE entrypoint!')
}
```

We can load other code that may use various DMT APIs and execute it periodically or just once.

For example, to run code on some specific device, we could do:

```js
import { executeAt } from 'dmt/common';

export default function init(program) {
  if(dmt.device().id == 'kids-room') {
    executeAt('20:00', () => program.player().play()); // run every day at 8pm
  }
}
```

This approach would generally mean a lot of boilerplate code to import files and to always check if we are on right device for some particular code.

💡 **There is now a better way!**

We can put all device specific code into `~/.dmt/user/engine/_devices` directory.

Let's put the same code above into file named `sleep music (kids-room).js` like this:

```js
import { executeAt } from 'dmt/common';

// because this is now in user/engine/_devices/sleep_music (kids-room).js 
// it will only run on 'kids-room' device
export default function init(program) {
  executeAt('20:00', () => program.player().play());
}
```

DMT will know it needs to execute this files only on `kids-room` device because in file name we put this device id between brackets `(kids-room)`.

Now everything is neatly organized and there is no more `if` checks needed to make sure we only run code on some device(s).

### _devices directory

Basic rules for file names inside `_devices` directory:

- each file specifies one or more devices between brackets in its file name — `some snippet description (device1).js` or `some snippet description (device1, device2, device3).js`
- there are two special pseudo device names we can use: `mainServer` and `mainDevice`. To make some code run on `mainDevice` we can name the file: `something (mainDevice).js` or  `something (mainDevice, mainServer, device3).js` to make it run on these three devices

### _devices/mainServer subdirectory

If we have multiple snippets that should only run on `mainServer` (which is very common), then we can better put all these snippets inside `~/.dmt/user/engine/_devices/mainServer`. We can even use further subdirectories to better organize our code:

```
david@turbine:~/.dmt/user/engine/_devices/mainServer$ tree
.
├── moonPhase.js
├── testingServer.js
└── uniqpathBigPicture
    ├── cryptoPrices.js
    ├── metalPrices.js
    └── oilPrices.js
```

All this code will only be loaded on `mainServer` and is very neatly organized and there is no boilerplate and even no added info to file names.

### _devices/mainDevice subdirectory

This works exactly the same as `_devices/mainServer` only that it runs on `mainDevice` instead of `mainServer`.

Additionally you can use the same approach with device names listed in brackets even in `mainDevice` and `mainServer` subdirectories to run these snippets on multiple devices if needed. For example:

```
david@turbine:~/.dmt/user/engine/_devices/mainServer$ tree
.
├── moonPhase (mainDevice).js
└── testing (device1, device2).js
```

In this case `moonPhase` code will get loaded on `mainServer` as well as on `mainDevice`.

`testing` code will be loaded on `mainServer`, `device1` and `device2`.

It works in similar way inside `_devices/mainDevice` directory:

```
david@turbine:~/.dmt/user/engine/_devices/mainDevice$ tree
.
├── subdir1
    ...
└── subdir2
    ├── test1 (lab).js
    └── test2 (mainServer, living-room).js
```

`test1` will be loaded on `mainDevice` and `lab` while `test2` will run on `mainDevice`, `mainServer` and device with id = `living-room`.

Happy life coding! DMT SYSTEM is always running in the background for you.