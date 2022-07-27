## Establishing connections and sending signals

**Client** in web browser or node.js process:

```js
import { connect } from 'connectome';

// connect to a connectome endpoint on localhost (default), to connect elsewhere use 'host:' argument
// connector will auto-reconnect if connection is dropped because network is not available
const connector = connect({ port: 8200, protocol: 'greetings' });

// when connected send a 'hello' signal
connector.on('ready', () => {
  connector.signal('hello', { name: 'Bob' });
});
```

💡 Use `connect({ host: 'example.com', port ... })` if you are not connecting  to `localhost` (node.js default) / `window.location.host` (browser default)

**Server** in node.js:

```js
import { Connectome } from 'connectome/server';

const connectome = new Connectome({ port: 8200 });

// fresh channel is created and passed into onConnect every time connection is established
// (for the first time or after temporary disconnect)
const onConnect = ({ channel }) => {
  // setup 'hello' signal handler on the channel
  channel.on('hello', ({ name }) => {
    console.log(`Hello ${name}!`);
  });
};

// register connectome protocol 'greetings''
connectome.registerProtocol({
  protocol: 'greetings',
  onConnect
});

// start connectome server
connectome.start();
```

💡Signals are simple named messages with json payload. They work symmetrically in both directions and you can use `channel.signal(...)` as well. 

💡Connectome protocols are agreements for communication between endpoints. They can include of `signals`, `rpc` and `state synchronization`. All of these are implemented by sending messages over connectome channels.

💡Object on client side (side that initiated connection) are called `connectors` while connection accepting side (Connectome server) objects are `channels`. Connections are long lived, encrypted and auto-reconnecting. Each connector will retry connection on disconnect and on each successful reconnect a new `channel` object is created on the other end of connection.

## Synchronizing state

This is the primary purpose and real focus of Connectome library: easy state synchronization between endpoints.

There are two types of state:

- **per endpoint / protocol state** where each connector has replica of (the same) protocol state
- **per connection** named state where state is set and updated per channel and state replica is visible on each connector

### Per protocol state

**Server:**

```js
import { Connectome } from 'connectome/server';
import { SyncStore } from 'connectome/stores';

const connectome = new Connectome({ port: 8200 });

const channels = connectome.registerProtocol({ protocol: 'dmt/player' });

// set shared per-protocol state which is reflected on all connected clients
const store = new SyncStore({ song: 'O Misterio', timeposition: 0 });

let timeposition = 0;
setInterval(() => { 
  // update timeposition state key
  store.update({ timeposition });
  timeposition += 1;
}, 1000);

connectome.start();
```

**Client:**

```js
import { connect } from 'connectome';

const connector = connect({ port: 8200, protocol: 'dmt/player' });

// each connector provides two main stores, one for connected status and one for shared protocol state
const { connected, state } = connector;

// on each 'connected status' change our subscription handler is called
connected.subscribe(ready => console.log(`Connection ready: ${ready}`));

// on each protocol state change (set on backend) we get the most recent state on client
state.subscribe(({ song, timeposition }) => console.log(`Playing ${song} at ${timeposition}s`));
```

Any client connected to this backend will have the same up to date state. You can try connecting multiple clients and reconnecting them at a later time. They will always receive the latest state which is generated at connectome endpoint over `player` connectome protocol.

💡Each `connector` object provides two useful stores which implement [this store contract](https://svelte.dev/docs#Store_contract). One is called `connected` and always provides the state of connection (connected or disconnected) and the other is store called `state` which contains any protocol state set on the backend (connectome endpoint).

💡 To refresh: connectome protocols are agreements that are implemented in code and can be documented. If you expect collaboration from others or for easier reference for yourself it is recommended to document each protocol your distributed app is using.

💡To learn how protocol state sync works "behind the scenes" and how to use it optimally please [read this](./help/PROTOCOL_STATE_SYNC_OPTIMIZATION.md).

### Per connection state

**Server:**

```js
import { Connectome } from 'connectome/server';

const connectome = new Connectome({ port: 8200 });

const users = [
  { token: 'aaa', name: 'Alice' },
  { token: 'bbb', name: 'Bob' }
];

// new connection handler
const onConnect = ({ channel }) => {
  channel.on('login', userToken => {
    const user = users.find(({ token }) => token == userToken);

    // set per-connection named state ('user') on channel that just received the 'login' signal
    channel.state('user').set(user);
  });

  channel.on('logout', () => {
    channel.clearState('user'); // or equivalently channel.state('user').set(undefined)
  });
};

// register default "no-name" protocol (since we do not pass in the protocol name)
connectome.registerProtocol({ onConnect });

connectome.start();
```

💡protocol does not need to be named if it is the only protocol on the endpoint but it is still a good practice to name the protocol for production code

**Client:**

```js
import { connect } from 'connectome';

const connector = connect({ port: 8200 });

// fields access per-connection named states on client
connector.field('user').subscribe(user => console.log(`Logged-in user: ${JSON.stringify(user)}`));

// example: .get() → one-time state read with no subscriptions
console.log(`Logged-in user: ${connector.field('user').get()}`); 

connector.on('ready', () => {
  setTimeout(() => connector.signal('login', 'aaa'));
  setTimeout(() => connector.signal('logout'), 500);
  setTimeout(() => connector.signal('login', 'bbb'), 1000);
});

// Produces ↴

// Logged-in user: undefined
// Logged-in user: undefined
// ✓ Protocol [ "no-name" ] connection [ ws://localhost:8200 ] ready
// Logged-in user: {"token":"aaa","name":"Alice"}
// Logged-in user: undefined
// Logged-in user: {"token":"bbb","name":"Bob"}
```

💡 per-connection state on client side is accessed through `connector.field('...')` to distinguish from shared per-protocol state (`connector.state`)

⚠️ default value for per-connection state on connector is `undefined` while per-protocol state on connector starts with default value `{}` (empty object)

##### Using from Svelte

Since `connector.connected`, `connector.state` and `connector.field(...)` all implement Svelte store contract you can use code like:

```html
<script>
import { connect } from 'connectome';
const { connected, state } = connect({ ... });
$: deviceName = $state.deviceName;
</script>
                           
{#if $connected === undefined}
  Connecting ...
{:else if $connected}
  Device name is: {$deviceName}
{:else} <!-- $connected == false --> 
  ✖ Disconnected
{/if}
```

in your Svelte templates. Svelte is a framework for ["Cybernetically enhanced web apps"](https://svelte.dev/) (framework is better than this tagline sounds :)

💡few hundred microseconds since _first initializing_ connection `$connected` value is `undefined` instead of `false` which can be useful information — for example we can show "Connecting" or some loader image or nothing... instead of telling the user that GUI is `disconnected` when it didn't even have the chance to connect for the first time

### RPC

[todo]
