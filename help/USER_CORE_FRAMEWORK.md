# User core framework

You have an option to extend `dmt-system` via a special `api` *(application programming interface)*.

Usually APIs allow you to connect to web services, this API is different.

When you add JavaScript (node.js) code into `~/.dmt/user/core/node`, then your code becomes part of `dmt-proc` and runs on all your devices.

## How it works?

It all starts in `~/.dmt/user/core/node/index.js`.

Note: all code here is in the form of ES6 modules (and not the older commonjs format!).

`index.js` has to export one function, called `init`:

```JavaScript
function init(program) {
  // further code
}

export default { init };
```

There is a few things you can do with and to the `program` instance that you receive as a part of `user core` initialization on each `dmt-proc` start on each device.

### Events emitted by program instance

Program instance emits a few events and we will describe each SOON™ but for now let's just look at the `tick` and `minute_rollover` events.

### Event: tick

```JavaScript
import dmt from 'dmt-bridge';
const { log } = dmt;

function init(program) {
  program.on('tick', () => log.green('tick event'));
}

export default { init };
````

Now try to run `dmt-proc` in foreground:

`dmt startfg`

You will see a log entry for the tick event every 2s:

```
eclipse pid 29269 12/29/2019, 2:00:37 PM 38728ms (+2006ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:39 PM 40736ms (+2008ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:41 PM 42745ms (+2009ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:43 PM 44752ms (+2007ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:45 PM 46759ms (+2007ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:47 PM 48767ms (+2008ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:49 PM 50776ms (+2009ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:51 PM 52782ms (+2006ms) ∞ tick event
eclipse pid 29269 12/29/2019, 2:00:53 PM 54788ms (+2006ms) ∞ tick event
```

### Event: minute_rollover

Every time a minute flips (for example 15:00 to 15:01 or 18:34 to 18:35) this event is emitted.

Since most of your devices will have exactly the same time down to a few milliseconds (using the `ntp` internet time synchronization protocol), you can use this event each minute to do something on all your device at the exact same time.

`dmt-proc` uses this internally to flip the displayed clock on all devices' GUIs at the exact same time.

```JavaScript
import dmt from 'dmt-bridge';
const { log } = dmt;

function init(program) {
  program.on('minute_rollover', () => program.showNotification({ msg: 'Seconds: ZERO', ttl: 5 }));
}

export default { init };
````

See next section for explanation of `program.showNotification()` helper function.

### Functions on program instance object

#### program.showNotification()

This shows notification on device's gui, similar to this:

![dmt_mountains_home](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_mountains_home.png?raw=true)

You use it in this way:

```JavaScript
program.showNotification({ msg: 'Doorbell ring', ttl: 60, bgColor: '#6D65F0', color: 'white' });
```

All parameters except `msg` are optional. Explanation:

##### ttl

Time-to-live in seconds.

##### bgColor

Background color of the notification bubble.

##### color

Text color for notification text.

# Using helper dmt-packages

You also noticed that you can include a few **dmt packages** into your `index.js` or any other file you include from `index.js`:

## dmt-bridge

Many useful functions / objects, more documentation coming in `v1.0.1`.

For now we describe just one object:

#### log

It provides these functions:

```JavaScript
log.write(...);
log.green(...);
log.red(...);
log.yellow(...);
```
etc.

Writes to dmt log file and also on terminal screen if `dmt-proc` is running in foreground (`dmt startfg` instead of `dmt start`).

## dmt-notify

See [push notifications section](PUSH_NOTIFICATIONS.md).

This is different from `program.showNotification(...)` because it sends a push notification to mobile phone, it is not used for displaying notification natively on your devices like the `showNotification` function is.

Usage:

```JavaScript
import { push } from 'dmt-notify';

function init(program) {
  program.on('tick', () => push.notify('tick event')); // you'll get a lot of push messages on your phone :)
}

export default { init };
```

This will send a push notification to all `admin` mobile phones. To send to all defined phones, use `push.notifyAll(...)`.

As described in push notification section — this is not yet very well supported but we still document it because it is already useful if you are an iPhone developer, you can figure it out and use already.

## dmt-iot

More about this in `dmt-system v1.2`. We are just showing you where is the point of integration with your custom `IoT` code and the `dmt-proc` / `dmt-system`.

## More deps

You can use any other dependency from `npm` or elsewhere.

See this example:

```
~/.dmt/user/core/node/node_modules (master)$ ls -la
.bin
dmt-bridge -> ../../../../core/node/dmt-bridge
dmt-iot -> ../../../../core/node/aspect-iot/dmt-iot
dmt-notify -> ../../../../core/node/dmt-notify
prettier
```

Prettier is a depenency that was installed in this way:

**1.**) `dmt unlink` → we remove our symlinks so they don't interfere with `npm install`

**2.**) `cd ~/.dmt/user/core/node; npm install prettier`

**3.**) `dmt link` → link our `dmt-packages` again so that they can be referenced from user core

And now we can include prettier in this way as usual (ES6):

`index.js`

```JavaScript
import prettier from 'prettier';

...
```

Any other node.js package can be installed in a similar way.

## General philosophy

One useful way of thinking about the entire `dmt-system` is as a lot of helpful framework functions, methods of code organization and general practices (simple device synhronization, local data on each device, coordination framework etc.) etc. **You can imagine whatever else you want** on top of this foundation and you have these extensibility places to add your code / logic:

**1.**) JavaScript code inside `~/.dmt/user/core/node`

**2.**) `bash` or `zsh` extension functions as described in [dmt shell framework](SHELL_FRAMEWORK.md).

**3.**) through `.def` files inside `~/.dmt/user/def` and `~/.dmt/user/devices/[deviceName]/def`

`dmt` is all the freedom and power to do whatever you want (reliably, independently, fairly) with your small (and big) computers. `dmt` cannot do anything alone but it can coordinate, monitor or integrate **everything you want** and in the exact way you want. If you don't like something anymore, you just have to replace it with something else and the central control point is always your code as opposed to outside services / APIs / devices / other people / etc. We hope you can start to see the point by now! 💡🚀🎸
