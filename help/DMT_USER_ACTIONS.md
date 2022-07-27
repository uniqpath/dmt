## DMT USER ACTIONS

User actions are triggered at the frontend by user. Handlers on GUI elements then use `connector` instance to send user actions to the `dmt-proc`:

```js
const protocol = 'david/home';
const connector = connect({ host, port, protocol });
...
connector.userAction({ action: 'off', scope: 'tv' })
```

On the backend it would look like this:

```js
program.developer('david').protocol('home').scope('tv').onUserAction(({ action }) => {
    if (action == 'off') {
      // turn off the TV
    }
  
  	if (action == 'volume-up') {
      // ...
    }
  
    ...
}
```

`scope` in user actions is like a namespace inside that protocol and developer can use this namespace however they want. In our case dealing with home IoT devices it makes sense for the scope to be that particular device. Device can then receive various user actions and some of them may even include a json payload when it makes sense.

The complete API for this is thus:

```js
connector.userAction({ action, scope, payload })
```

and

```js
program.developer(…).protocol(…).scope(…).onUserAction(({ action, payload }) => { … }))
```

or

```js
// action-specific handler 
program.developer(…).protocol(…).scope(…).onUserAction('action1', () => { … }))

// action-specific handler with payload
program.developer(…).protocol(…).scope(…).onUserAction('action2', ({ payload }) => { … }))

// handle every user action on the protocol
program.developer(…).protocol(…).onUserAction(({ action, scope, payload }) => {
  // we probably use ifs and switches here (on scope and action)
}))

// or perhaps we are not using scopes and have just one global unnamed scope in our protocol
program.developer(…).protocol(…).onUserAction(({ action, payload }) => {
  switch(action) {
    …
  }
}))
```

### Registering the protocol inside dmt-proc

We also have to register the protocol:

```js
program.developer(dmtID).registerProtocol(protocol, onConnect)
```

Example:

```js
program.developer('david').registerProtocol('home', ({ program, channel }) => { ... })
```

or

```js
const dmtID = 'david';
const store = program.developer(dmtID).protocol('home').createStore(initialState, { unsavedSlots: ... });
store.sync(program.developer(dmtID).registerProtocol('home')); // automatically sets up syncing of state to frontend
```

Store state will be saved to `~/.dmt-here/state/david/home.json`.

Example for turning some light on and off and also turning off with delay — we manipulate specific slot:

```js
const slot = program.dev('david').protocol('home').slot('lights')
```

by calling `.update()` or `.removeKey()` on it. Changes to this store are automatically reflected in the frontend `$state`.

💡 `program.dev()` is an alias for `program.developer()`.

If we want the reference to the entire protocol `SyncStore` instead of one `slot` inside of it we could do:

```js
program.dev('david').protocol('home').store();
```

### Example with mqtt-enabled wifi connected sonoff basic IoT module

This module is simply turning some light on and off. We also enable off delay which requires keeping some state on our local dmt-proc hub.

![Ligh Lab DMT MOBILE](https://raw.githubusercontent.com/uniqpath/info/master/assets/img/lab-light-dmt-mobile.png)

**protocol.js**

```js
const dmtID = 'david';
const protocol = 'home';

export { dmtID, protocol };
```

```js
import { mqttClient } from 'dmt/iot';

import DelayedAction from './delayedAction.js';

import { push } from 'dmt/notify';

let timer;

const START_DELAY = 120;
const DELAY_STEP = 60;

// how much time before turning off the light we should warn
const WARN = 30;

import { dmtID, protocol } from './protocol.js';

const slotName = 'lights';

const NOTIF_GROUP = 'light-lab-warn-notification';

function setup(program) {
  if (program.isHub()) {
    const slot = program.dev(dmtID).protocol(protocol).slot(slotName);

    const turnOff = () => {
      mqttClient.send('light-lab', 'off');
    };

    const turnOn = () => {
      mqttClient.send('light-lab', 'on');
      program.cancelNotifications(NOTIF_GROUP);
    };

    const delayedLightOff = new DelayedAction({
      // called every second after start of delayed action
      countdown: () => {
        let { labLightOffDelay } = slot.get();

        labLightOffDelay -= 1;

        const offMsg = 'Lab-light off';

        if (labLightOffDelay <= WARN) {
          const when = labLightOffDelay ? `in ${labLightOffDelay}s` : '';
          program.nearbyNotification({
            msg: `${offMsg} ${when}`,
            color: '#BE3B79',
            ttl: WARN + 3, // will cancel down below
            group: NOTIF_GROUP,
            omitDesktopNotification: true,
            omitTtl: true,
            dev: true
          });
        }

        slot.update({ labLightOffDelay });

        if (labLightOffDelay == 0) {
          setTimeout(() => {
            program.cancelNotifications(NOTIF_GROUP);
          }, 2000); // a bit longer so that we can see on tablet that light was turned off because of delayed command

          push.omitDeviceName().notify(offMsg);

          // countdown finished, trigger action now
          return true;
        }
      },
      action: () => {
        turnOff();
        setTimeout(() => {
          slot.removeKey('labLightOffDelay');
        }, 1000); // keep message about light turn off in the gui for 1s
      }
    });

    // we have some delay in persisted state
    // nothing else will trigger countdown except manual call to delayedLightOff.start()
    if (slot.get().labLightOffDelay) {
      delayedLightOff.start();
    }

    program.dev(dmtID).protocol(protocol).scope('light-lab').onUserAction(({ action }) => {
      const { labLightOffDelay } = slot.get();

      switch (action) {
        case 'on':
          clearTimeout(timer);
          delayedLightOff.cancel();
          slot.removeKey('labLightOffDelay');

          turnOn();
          break;

        case 'off':
          clearTimeout(timer);
          delayedLightOff.cancel();

          if (labLightOffDelay != undefined) {
            slot.update({ labLightOffDelay: 0 });
          }
          turnOff();
          program.cancelNotifications(NOTIF_GROUP);
          break;

        case 'off-delay':
          clearTimeout(timer);

          turnOn();

          let delay;

          // 0 or undefined
          if (!labLightOffDelay) {
            delay = START_DELAY;
          } else {
            // 55 -> 60
            // 57 -> 60
            // 58 -> 120
            // 60 -> 120
            // 65 -> 120
            // 118 -> 180
            // 150 -> 180
            delay = Math.floor((labLightOffDelay + 2) / DELAY_STEP) * DELAY_STEP + DELAY_STEP;
          }

          slot.update({ labLightOffDelay: delay });

          delayedLightOff.start();
          break;

        default:
          break;
      }
    });

    mqttClient.receive(({ topic, msg }) => {
      if (topic == 'light-lab' && ['on', 'off'].includes(msg)) {
        if (msg == 'off') {
          clearTimeout(timer);
          delayedLightOff.cancel();

          timer = setTimeout(() => {
            slot.removeKey('labLightOffDelay');
          }, 1000);
        }
      }
    });
  } 
}

function handleMqttEvent({ program, topic, msg }) {}

export { setup, handleMqttEvent };

```

**delayedAction.js**

```js
export default class DelayedAction {
  // countdown is a callback that subtracts the counter on each call
  // when counter reaches zero it should return true
  constructor({ action, countdown }) {
    this.action = action;
    this.countdown = countdown;
  }

  start() {
    this.cancel();
    this.timeout = setTimeout(() => this.__loop(), 1000);
  }

  cancel() {
    clearTimeout(this.timeout);
  }

  __loop() {
    if (this.countdown()) {
      this.action();
    } else {
      this.start();
    }
  }
}
```

**Frontend:**

```js
const hubIP = '192.168.0.20'
const port = 7780;
const protocol = 'david/home';
const connector = connect({ host: hubIP, port, protocol });

const { connected, state } = connector;

$: labLightOffDelay = $state.lights?.labLightOffDelay

function lightLab(action, payload) {
  connector.userAction({ action, payload, scope: `light-lab` })
}
```

```html
<h3>Lab Light</h3>

<button on:click={() => { lightLab('on') }} disabled={!$connected}>
   ON
</button>

<button class="turn_off" on:click={() => { lightLab('off') }} disabled={!$connected}>
   🛑 OFF
</button>

<button on:click={() => { lightLab('off-delay') }} disabled={!$connected}>
   ⏱️
</button>

{#if $connected && labLightOffDelay != undefined}
   <h3 class='countdown'>Turning off
     <span in:fade>
       {#if labLightOffDelay == 0}
          NOW
        {:else}
          in {labLightOffDelay}s
        {/if}
     </span>
  </h3>
{/if}
```

