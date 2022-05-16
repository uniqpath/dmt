# DMT STATE

### Fundamentals

The concept of **state** is one of the fundamental concepts in the entire venerable Computer Science. Any state is fundamentaly made of **bits**. The simplest possible state is just **1 bit**. Each **bit** can be either in **state 0** or **state 1**. State consisting of 8 bits has 2<sup>8</sup> possible arrangements: State<sub>0</sub> ... State<sub>255</sub>.

```
State0   = 00000000
State1   = 00000001
State2   = 00000010
State3   = 00000011
...
State255 = 11111111
```

👆 Our **state space**.

If we have an 8-bit integer variable `n` then this variable can take one of the values from its state space:

```js
let n = 0;   // represented in memory / physical media with these bits: 00000000
// ...
let n = 100; // 01100100
// ...
let n = 200; // 11001000
// ...
let n = 255; // 11111111
```

We have a **bounded state space** in this case because there is a **finite amount of possible states**.

Here is another example of state in the form of a well-known data structure called dictionary or hashtable, this example is in JavaScript:

```js
const people = { "Ann": 20, "John": 77, "Mary": 5 };
```

We have any number of people with corresponding ages. This state is more advanced than a single number or even single string (set of letters) but is also fundamentally represented in bits. We don't see how and we can just abstract this away because it is not important on this level of thinking, we let the compiler / interpreter and system hardware take care of all the details. What is important to note is that this data structure can be treated as our program (or at least subroutine) state and also that it is **unbounded** (we can theoretically put in an infinite number of people or also just one person with infinite number of possible names and ages for the same effect of not having a finite state space anymore).

### Semantic overloading of the word "state"

Maybe you noticed that the word ***state*** is a somewhat overloaded (having a few distinct but related meanings) and we're not even talking about state as in *nation state* (which would be a more distant meaning of the word). 

Regardless we can and will be very precise in this document but we still have **two (very related) meanings** that we need to keep in mind:

- **current state** as one of the possibilities in our state space (`0` or `1`, `00000000`...`11111111`, infinite state space of all possible people with all possible ages)
- **state as a named entity** which is itself in one of the possibilities of its state space (for example the variable `people`)

Example:

**State** `people` *(meaning #1)* is currently in **state** `{ "Ann": 20, "John": 77, "Mary": 5 }` as one of the possible states it can be in *(meaning #2)*.

### Reading and writing state

Bits are **read** and **written**. When we read a bit from permanent physical media, we have a **copy of that bit** in volatile memory. Original bit is now separate from what we have in memory. If we change our bit in memory the source bit does not automatically change and we have a discrepancy Sometimes this matters, sometimes it does not matter immediately or at all but it depends on the situation. 

Once we have our copy of a bit (or some more involved state) in memory we can freely pass it around the program and use it (read-only) but as soon that we need to write to it (change it) we immediately get a mentioned discrepancy between the copy in memory and the original source of information (physical media). Maybe the source state on permanent media doesn't need to get updated right away and can be done so with some delay (asynchronously). In case we always need to have fully synced state then implementation would do any state write to physical media first and only when it succeeds it would update our copy in volatile memory. We could then use (read) it anywhere again knowing that its state is in sync with its source copy on physical (permanent) media.

Similar thought process is needed if we need to keep some state synchronized between remote endpoints over the network. In the simplest scenario we only allow **state writes at exactly one end** and not all endpoints but there is a vast design space with different performance tradeoffs and implementation challenges here. We will touch some of these points as we go along in this document.

### The purpose of this document

DMT STATE manipulation is designed to be the simplest possible for the needs of DMT SYSTEM. It still needs proper study and explanation even if it is far from the end of complexity spectrum. We think DMT STATE design is easy to understand. It can also serve as a general education for consistent and elegant program state manipulation in general. For best possible understanding of course please read the entire document. There is hopefully not *1 bit* of information here that doesn't serve the purpose of clarity about the system design. You will know exactly how DMT STATE manipulation works and why and you will know how to utilize and use DMT STATE manipulation techniques in your own DMT APPS. You will also see that we applied general Computer Science principles and you will also possibly know much more about the purpose and inner workings of blockchains which are a special kind of **state machines**. DMT STATE and blockchain state are very different but also almost the same from the fundamental point of view of state transitions.

### From bits to variables

Suppose we have **state A** which is currently in state `['a', 'b', 'c']` (💡 remember the double meaning):

```js
const A = ['a', 'b', 'c'];
```

This array with three letters **['a', 'b', 'c']** is our initial state which we name **A** (as in "**a**rray").

We will keep **the name A** for our current state all along, no matter how the actual state it represents changes (evolves over time).

### Changing the state

Let us send the **update** request to the state object:

```js
A.push('d');
```

We do so by calling a built-in function `push` which all arrays in JavaScript have.

Our new state becomes (we can check in `node.js` console):

```js
> A [enter]
[ 'a', 'b', 'c', 'd' ]
```

The message *(function call)* `push` with an element to push *('d')* to the end of our state object iterated our state:

>  State<sub>0</sub> → State<sub>1</sub>

It did so by **mutating the state in place**, there is no trace of previous state in our computer memory anymore. Previous state is lost. These are implementation details but we need to understand the difference between **state transition** and **state mutation**. In our case we implemented state transition with state mutation because we discarded our previous state by mutating it. We could also save the entire history and this is beneficial in many cases but for the purpose of DMT STATE we do not need to do it **and we don't**. We will now compare this to how blockchains work. We shall see that the point of blockchains is to keep the entire state transition history saved on multiple copies with the **current state** still being the most important thing. Just like in our current `A` example. Everyone obtaining an entire replica of some blockchain should in theory be able to arrive at the latest blockchain state by applying all the transactions to the genesis block and thus evolving the state of the blockchain one block per time until it reaches the present.

### Blockchain state

This is only partially relevant to our further depiction about the purpose and concrete usage of DMT state implementation.

It is still interesting to see how broadly speaking we are looking at the exact same concept with some differences as already mentioned, main one being if we decide to save the entire state transition history or not and of course many others that we put in short explicit focus a bit later. 

Any blockchain starts from some *state* (genesis state) — Bitcoin initial state is special, it was entirely empty with zero balances on any accounts while Ethereum state started with balances of ICO participants and with clean state of smart contracts. Bitcoin iterated state through mining rewards and through people sending balances to each other. Each transaction in Bitcoin is a state update. Ethereum entirely the same with difference that transactions are more complex than just sending balances from one account to the other. In addition to this Ethereum transactions can include function calls to specific smart contracts. In simplistic example of one particular deployment of smart contract like this:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.11;

contract A {
  string[] strings = ['a', 'b', 'c'];

  function push(string memory s) public {
    strings.push(s);
  }

  function lastElement() public view returns(string memory) {
    return strings[strings.length - 1];
  }
}
```

When this smart contract is deployed it gets a permanent address in the (Ethereum) blockchain, let's assume that the address is `0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8` in this case. This is like an actual object of type `contract A` and `contract A {}` is like a class (template).

Calling a function `push` on this instance of the smart contract with argument `d` looks like this:

```
[vm] from: 0x5B3...eddC4 to: A.push(string) 0xd8b...33fa8 value: 0 weidata: 0x4f3...00000 logs: 0 hash: 0x953...5b476
Transaction mined and execution succeed
transaction hash	0x953d037a79d4510a61c71d903f322afec35260238febf7c6d6593a42fd65b476
from	0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
to	A.push(string) 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
gas	57563 gas
input	0x4f3...00000
decoded input	{
	"string s": "d"
}
decoded output	 - 
logs	[]
val	0 wei
```

This is very similar (even the same!) conceptually to the call `a.push` in previous example with simple local variable inside a javascript process but the difference is still substantial when we look at what is being achieved.

We notice that transaction gets its own `transaction hash`, that it has to be mined (included in a block to take effect), that it has to be signed with a valid private key (corresponding to the address `0x5B38Da6a701c568545dCfcB03FcB875f56beddC4`), that it consumes some `gas` and thus spends some `ether` currency (fuel) and that it didn't transmit any value (0 wei) in this case because it was not a balance transfer but rather a pure smart contract call. `wei` is a subdivision unit of `ether`.

`A.push` was an example of state-modifying transaction (eg. **write**). Let us now check that our call / transaction really did modify the smart contract state - so we **call** the `lastElement` function. This function is marked `view` and does not cost gas and does not write anything to blockchain, it will simply read the information from our blockchain node:

```
call to A.lastElement
CALL
[call] from: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4 to: A.lastElement() data: 0xe1a...5cbb7
from	0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
to	A.lastElement() 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
execution cost	27003 gas (Cost only applies when called by a contract)
input	0xe1a...5cbb7
decoded input	{}
decoded output	{
	"0": "string: d"
}
logs	[]
```

This part is important:

```
decoded output	{
	"0": "string: d"
}
```

We verified that our previous transaction really did write to our safe distributed state (smart contract). We paid some price for this safety in form of the `ether` cryptocurrency. Anyone can push further elements into our smart contract internal array but nobody can delete any information because the smart contract does not allow for this. Even if it did allow deletion we could still go back in history and get to old information at some previous point assuming we have a full node. Regular reads would no longer return old data because the current state would not have it anymore, only some previous state.

### Blockchain state transitions recap

Blockchain state is replicated over many machines (nodes) which are all tasked with iterating that state in such manner that the state is the same accross all nodes and that it iterates according to specific predermined rules about transaction processing. Only users with valid keys to accounts that hold balance can send transactions (= state transitions) to the network. As these transactions are picked up and validated by global network consensus, they are included in blocks. Blocks filled with some number of transactions then iterate state in the same way as before:

> State<sub>n</sub> → State<sub>n+1</sub>

by applying all transactions from block<sub>n</sub> to State<sub>n</sub> and effectively producing State<sub>n+1</sub> which then awaits the next block<sub>n+1</sub> which then produces  State<sub>n+2</sub> and so on.

In case of Ethereum applying transaction means:

- transfering simple balances between accounts
- actually processing smart contract code on each node based on transaction payload
- creating new smart contracts by a special transaction whose payload is a compiled smart contract code in binary form

### DMT STATE vs. blockchain state comparison

Blockchains are global, programmable, secure and permissionless databases that apply state transitions based on valid transactions that users send. Transactions are packed into blocks and applied on each node once the block has been confirmed. Sending of transactions is slow and they cost money. This is all for a reason: security. They are still much faster than regular *actual* bank settlements.

In contrast DMT STATE is a much more classic example of small state manipulation inside each particular machine.

Main points:

- DMT PROGRAM state is small
- State transitions are very fast
- State is on most updates automatically replicated to permanent storage taking into the consideration the number of writes (important on flash media which degrades over time with number of writes)
- State is quickly and automatically replicated to any remote connected endpoints (within milliseconds)

Conclusions of this comparison for educational purpose are that in both cases we are dealing with a **replicated state machine**, one is **vast and growing, slow, expensive, global, permisionless (while still secure which is incredible) and it saves the entire history of state transitions** while the other (DMT STATE) is **local but for this reason very fast, free (no token), does not save state transitions and is also replicated to a) local storage of device b) any connected endpoints (like GUIs)**.

### Back to DMT STATE

Now we are finally ready to go fully into how DMT STATE is implemented, what purpose it serves and how it works.

## Enter SyncStore

`SyncStore` is an extremely **powerful** and **simple-to-use** *key-value store*.

Why **Sync**Store? Because it can synchronize its state in **two** different ways (can use both at the same time):

- it can save its state to permanent media (into a file)
- it can sync the state over one or more connected websockets (connectome channels, more about this later)

This all happens automatically after just a small bit of configuration.

How SyncStore works when it is not yet syncing its state anywhere? Here is how we define the store and then update one of its keys. 

Values on root level are key-value stores so state usually looks like this:

```js
{
  device: {
    deviceName: 'myPC',
    startedAt: 1655406122264
  },
  player: {
    volume: 80
  }
}
```

### Creating a store

We would create an empty store like this:

```js
import { SyncStore } from 'connectome/stores';

const store = new SyncStore();
```

### Updating the state

and then update its state:

```js
store.key('device').update({ deviceName: 'myPC', startedAt: Date.now() });
store.key('player').update({ volume: 80 });
```

or we could create a store with initial state:

```js
const store = new SyncStore({
  device: {
    deviceName: 'myPC',
    startedAt: 1655406122264
  },
  player: {
    volume: 80
  }
});
```

and then update its state as needed:

```js
store.key('player').update({ volume: 70 }); // user turned the volume down
```

Info about `update`:

Update function works by merging the keys, it will not replace the entire slot (root key) state:

```js
store.key('device').update({ platform: 'linux' });
```

Will produce this internal state for `device` key:

```js
device: {
  deviceName: 'myPC',
  startedAt: 1655406122264,
  platform: 'linux'
}
```

While 

```js
store.key('device').set({ platform: 'linux' });
```

would result in this:

```js
device: {  
  platform: 'linux'
}
```

### Reading state

We read state like this:

```js
store.key('player').get().volume;
```

or as a shorthand:

```js
store.key('player').get('volume'); // 80
```

We could also output its entire state:

```js
store.state();

// {
//  device: { deviceName: 'myPC', startedAt: 1655406122264 },
//  player: { volume: 80 }
// }
```

### Persisting state

Let's create a store that syncs its state to and from a file:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const store = new SyncStore({}, { stateFilePath });

console.log(store.key('device').get('deviceName'));
// will output undefined on the first run
// and "myPC" on second run of this program

store.key('device').update({ deviceName: 'myPC' });
```

If you do `cat state.json` you will see saved state:

```json
{
  "device": {
    "deviceName": "myPC"
  }
}
```

### Announcing state changes

It is important to understand the concept of **announcing state**. `SyncStore` announces new state (which means it is written to the file or transmitted over websocket connections) every time there is a state update - for example calling `update` function (but there are others state update functions too).

Sometimes we can optimize and reduce the number of consecurive announcements by doing this:

```js
store.key('device').update({ deviceName: 'myPC', startedAt: 1655406122264 }, { announce: false });
store.key('player').update({ volume: 80 });
```

Now the first state update will not trigger a save to permanent storage since the second call is so close that it is more optimal to wait and then persist both state updates at the same time.

Each state update function supports `{ announce: false }` option, for example:

```js
store.key('device').remove({ announce: false });
```

`remove()` is a function that updates the state by removing the entire key-value pair from the store. If we call it like this it won't immediately write the change to permanent storage (hard drive) or send it over the wire to connected clients.

We can also call:

```js
store.announceStateChange();
```

manually if this is ever needed. `dmt-proc` for example utilizes this option **once**, in an interval, once every 2 seconds so that in case there were unannounced state changes in that period (for performance reasons) they will all get persisted at latest at each 2s interval. This is more optimal but also means a short delay. If there are no state changes since last announce then `announceStateChange()` will not actually announce state change. 

One good example when this is great is reading date from a lot of sensors on local network, each may send many data points each second and if we announced state change on each such data point it would quickly get out of hand with many sensors. A great compromise is to collect state changes as data comesin  (updating state with `{ announce: false}` every time as fast as needed) and then actually report changes through manual announce every 2s.

`SyncStore` allows for this flexibility, all we have to do is to be careful not to overload the store with state announcements. In case we do, there will be warnings in log:

```
[todo] frequent announce warn
```

We can turn these off with `warn: false` option to `SyncStore` but it would be better to optimize and reconsider the approach so there are mostly no warnings.

```js
const store = new SyncStore({}, { stateFilePath, warn: false });
```

Another warning we can get is if diffing the state on our updates is taking too long which means our state is either to big or in wrong shape for this approach, also reconsider because otherwise your system will not be sufficiently performant.

```
[todo] diffing warn
```

### Not persisting certain data

By using `unsavedSlots` (`slot` is another name for root-level key) option we can prevent certain "slots" from being persisted entirely.

```js
const store = new SyncStore({}, { stateFilePath: './state.json', unsavedSlots: ['player'] });
```

Now `state.json` will not contain `player` key, this state would have to be recreated from scratch next time our process runs. Perhaps volume is stored in external media player and we read it from there at program start (`dmt-proc` does not do that though).

If we want more granular control over what is being persisted, we can do whatever is needed by using another option, `beforeLoadAndSave` option:

```js
const beforeLoadAndSave = state => {
    if (state.player) {
      for (const key of Object.keys(state.player)) {
        if (key != 'volume') {
          delete state.player[key];
        }
      }
    }
  };
  
const store = new SyncStore({}, { stateFilePath: './state.json', unsavedSlots: ['device', 'environment'], beforeLoadAndSave });
```

This is how `dmt-proc` does it - some slots are unsaved entirely and in `player` slot we actually keep `volume` and then force external player `mpv` to that volume on each `dmt-proc` run. We disregard everything else in `player` slot and don't save these fields. We tell `SyncStore` this by deleting all fields we don't need (keeping just `volume`) inside the `beforeLoadAndSave` callback which receives cloned state on every state change announce immediately before saving as well as on initial state load.

An example of the field on `player` slot that is not saved inside `dmt-proc` state is `currentMedia`. This field is read on `dmt-proc` start from `mpv` inter-process communication. Whatever `mpv` is currently playing is an authoritative data and our state is filled from that. This is the opposite from `volume` where we tell `mpv` what the correct volume is on each `dmt-proc` start. 

The design space is very flexible as we can see. Whatever fits the application purpose `SyncStore` state management can do.

### Schema version

Every time there is data (state) and code that manipulates this data there can be mismatches if code expects different data format.

This can easily happen if we decide to change the format of our state, for example renaming some keys / values or making them arrays `([])` instead of dictionaries `({})` etc. This will most likely lead to our program stopping to work - it will crash or misbehave when it reads persisted state in older format (schema) and trying to update / manipulate it with evolved code.

The solution is to start versioning our data schema, like so:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const STATE_SCHEMA_VERSION = 0.1;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION });

store.key('device').update({ deviceName: 'myPC', startedAt: Date.now() });
```

Our `state.json` will look like this:

```json
{
  "schemaVersion": 0.1,
  "device": {
    "deviceName": "myPC",
    "startedAt": 1655406122264
  }
}
```

We see that `schemaVersion` field was added.

Is this all there is to learn about schema versioning? Unfortunately no, it is just a start, this is a crucial topic and so it is worth going further, we need to look into how this really works in detail.

⚠️ **Transitioning between schema versions without providing schema migrations (we'll look into this next) will cause loss of saved state.**

This data loss is by design and very good for keeping our program running without problems.

In general whatever we have in our state in `SyncStore` should be easy to recreate from other sources, so this store is not primarily meant for long-term data storage like a database. It can temporarily function for this purpose as well but we have to be careful and understand exactly how it works and what is its purpose.

After running the example above now try running this:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const STATE_SCHEMA_VERSION = 0.1;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION });

store.key('player').update({ volume: '50' });
```

When checking the contents of `state.json` you should see:

```json
{
  "schemaVersion": 0.1,
  "device": {
    "deviceName": "myPC",
    "startedAt": 1655406122264
  },
  "player": {
    "volume": "50"
  }
}
```

As expected, no surprises here!

Now let's try running this:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const STATE_SCHEMA_VERSION = 0.2;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION });

store.key('environment').update({ temperature: '20' });
```

Notice that we updated our `STATE_SCHEMA_VERSION` from `0.1` to `0.2`.

When we look into `state.json` we see this:

```json
{
  "schemaVersion": 0.2,
  "environment": {
    "temperature": "20"
  }
}
```

**⚠️ Our entire state from before (with `device` and `player` root keys) was purged.**

This is by design and makes programing model easy to understand. The rules are simple:

- if we go from not having a `schemaVersion` in persisted state to having some `schemaVersion` in `SyncStore` constructor then the entire previously saved state without `schemaVersion` is discarded on load — this makes sure we don't run into big issues trying to use the state in wrong format
- same thing happens if saved data has `schemaVersion` but it does not match current `schemaVersion` in `SyncStore` constructor — we drop the entire state again
- conclusion: state is dropped if persisted `schemaVersion` and current `schemaVersion` do not match
- 💡never go back down in `schemaVersion`, **number only go up**! This includes not going back to not having a `schemaVersion` in your `SyncStore` constructor once you started versioning your state schema. If you don't follow this rule, there will be a lot of mess and this entire system of versioning schema in this simple way is broken. 
- Note also that in this simple example it wasn't really neccessary to bump the `schemaVersion` because no attributes were renamed or data structures changed... but maybe we really stopped caring about `device` and `player` — in this case this indeed is schema change and bumping `schemaVersion` is justified — we wanted to purge these two unneccessary keys from persisted state.

Good rule is to start developing locally without using `schemaVersion` but once the design is firm enough, start with version `0.1` and bump the version once the state format changes. If you don't care about not losing state on these instances, that's it. Sometimes state really is easily recreated or relatively easy recreated. One instance would be user playlists. Of course users would not be very happy if these were gone but if playlist format changes in initial stages of development we might as well lose a few instances of playlist data with a few users. 

If keeping state on schema updates is important, then read on!

Exact algortihm:

```js
function loadState({ stateFilePath, schemaVersion, schemaMigrations }) {
  if (fs.existsSync(stateFilePath)) {
    try {
      const loadedState = JSON.parse(fs.readFileSync(stateFilePath));
      
      if (schemaVersion) {
        if (!loadedState.schemaVersion) {
          return; // drop state
        }

        if (loadedState.schemaVersion != schemaVersion) {
          // either migrates or also drops state if cannot migrate (will return undefined instead of state)
          return migrateState({ state: loadedState, schemaVersion, schemaMigrations });
        }
      } else if (loadedState.schemaVersion) {
        return; // drop state
      }

      // we land here if:
      // loadedState.schemaVersion and schemaVersion match (same number or they are both undefined)
      return loadedState;
    } catch (e) {
      //log.red('⚠️  Discarding invalid persisted state.');
    }
  }
}
```

### Schema migrations

Schema migrations are the solution to not losing state when schema (data format) changes.

Start with this example again:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const STATE_SCHEMA_VERSION = 0.1;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION });

store.key('device').update({ deviceName: 'myPC', startedAt: Date.now() });
```

Let's assume we want to change `deviceName` on `device` key to just `name`, like so:

```js
device: {
  name: 'myPC',
  startedAt: 1655406122264
}
```

We want to start refering to it like this:

```js
store.key('device').get('name');
```

If we try running this now:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const STATE_SCHEMA_VERSION = 0.1;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION });

console.log(store.key('device').get('name'));
// ↳ undefined
```

We get `undefined` because our `state.json` contents still looks like this:

```json
{  
  "device": {
    "deviceName": "myPC",
    "startedAt": 1655468820917
  },
  "schemaVersion": 0.1
}
```

What we need is to carefully construct a state schema migration:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const schemaMigrations = [];

const migration = {
  fromVersion: 0.1,
  toVersion: 0.2,
  migrator: state => {
    const { device } = state;
    if (device) {
      if (device.deviceName) {
        device.name = device.deviceName;
        delete device.deviceName;
      }
    }
  }
};

schemaMigrations.push(migration);

const STATE_SCHEMA_VERSION = 0.2;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION, schemaMigrations });

console.log(store.key('device').get('name'));
// ↳ myPC
```

Everything worked!

If we check `state.json` again we see a little surprise though:

```json
{  
  "device": {
    "deviceName": "myPC",
    "startedAt": 1655468820917
  },
  "schemaVersion": 0.1
}
```

So although we have loaded the old state, then migrated it to use in-memory, we never saved anything back (no state updates and `announce` and no writing to permanent media) and thus state with older `schemaVersion` = `0.1` is still on the disk.

try adding this line to the end of previous program:

```js
store.key('device').update({ startedAt: Date.now() });
```

When examining `state.json` we should see something like this finally:

```json
{  
  "device": {
    "name": "myPC",
    "startedAt": 1655469327356
  },
  "schemaVersion": 0.2
}
```

😉👌

With this approach we can contain these breaking changes into just one migration which has to be kept around but everything else is new code which safely assumes it is working on up to date saved state format (schema).

⚠️ Notice that if at any point the chain of versioning is broken and a migration is missing then **we drop the state**, as usual.

For example:

```js
const STATE_SCHEMA_VERSION = 0.5;
```

While in `state.json`:

```json
{  
  "device": {
    "name": "myPC"
  },
  "schemaVersion": 0.2
}
```

but we only have these migrations:

```js
const schemaMigrations = [];

const migration1 = {
  fromVersion: 0.1,
  toVersion: 0.2,
  migrator: …  
};

const migration2 = {
  fromVersion: 0.2,
  toVersion: 0.3,
  migrator: …  
};

const migration3 = {
  fromVersion: 0.4,
  toVersion: 0.5,
  migrator: …  
};

schemaMigrations.push(migration1);
schemaMigrations.push(migration2);
schemaMigrations.push(migration3);
```

`SyncStore` will not know how to get from `schemaVersion` `0.2` to `0.5` because it can only do this:

`0.2` → `0.3` ✓ using `migration2`

`0.3` → `0.5` ✖ there is no path to `schemaVersion 0.5` because `0.3` to `0.4` is missing

**⚠️ This state will be dropped upon loading from permanent storage**

Some other state that may be in `schemaVersion` `0.4` through some previous coding would be able to get migrated to `0.5`.

💡 As we can see schema migrations are rather elegant but one still has to be very disciplined otherwise the least it can happen is loss of state (hopefully not important / easily recreated) or **much worse** bringing program in inconsistent state, for example by changing existing migrations once they have already ran on some persisted state or making bugs in migrations. If this happens then the best is to bump the `schemaVersion` again without a migration  and expect a state data loss to get out of the mess. In this case all previous migrations can also be deleted and the latest `schemaVersion` becomes the green slate which was forced upon everyone because a bug. Hey, bugs happen! What is the price for resolving them is the question. Sometimes it is easy to purge all the data and with general expectation that DMT STATE should be used for mostly easily (more or less) recreated state we as DMT users expect an occasional soft reset. If these can be minimized, much power to us :) In any instance the tradeoff of program crashing and/or much more headache while developing and iterating complex software is worth having the option of just starting with green slate once in a while. Having such an option is reassuring but as said we still encourage proper and thoughtful development.

⚠️ If there is an exception in any migration, we also drop the entire state and continue from scratch

**💡When we say "state is dropped" we actually make a safety copy**

Let's try:

```js
import { SyncStore } from 'connectome/stores';

const stateFilePath = './state.json';

const STATE_SCHEMA_VERSION = 0.7;

const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION });

store.key('device').update({ platform: 'macOS', startedAt: Date.now() });
```

After running this you will get `state.json` with similar contents:

```json
{
  "device": {
    "platform": "macOS",
    "startedAt": 1655480415236
  },
  "schemaVersion": 0.7
}
```

And also a file with similar name to this `state-recovery-1655480415235.json` which will contain previous state, probably:

```json
{  
  "device": {
    "name": "myPC",
    "startedAt": 1655469327356
  },
  "schemaVersion": 0.2
}
```

if you followed this tutorial exactly.

If for whatever reason you don't want accumulation of such files and you plan to drop state ocassionaly while in development, you can do this:

```js
const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION, noRecovery: true });
```

Be careful but now you know all the tradeoffs and can decide what is best for your development use case(s) at any particular moment 😎.

It is probably useful to do this:

```js
const store = new SyncStore({}, { stateFilePath, schemaVersion: STATE_SCHEMA_VERSION, noRecovery: IS_PRODUCTION });
```

To basically only have recovery while developing and testing, just in case... to prevent migration mistakes .. but in production it does not make sense to pile up recovery files that users don't know what to do with probably. If we manage to lose some state, it was probably not that important or at least it should not be.

## Extras

Now that we went through all the hard stuff and core concepts on `SyncStore` let us mention two more useful things with examples.

### Array slots

Usually root keys (slots) are dictionaries (`{}`, or 'object' in JavaScript) but sometimes we want them to be arrays.

We do it like this:

```javascript
store.slot('notifications').makeArray();
```

or

```javascript
store.key('notifications').makeArray();
```

This will initialize the slot properly and allow us to use some state update functions specific for arrays (see API below).

### Muting state announce

Whether state needs to be `announced` (which means persisted to disk and/or to connected clients over Connectome) is calculated on each state update or on explicit `store.announceStateChange()` call by diffing previously announced state with latest state.

Sometimes the state will contain values that are actually irrelevant in this regard.

We have an option to remove these values to make announcing more efficient so we do not overload the process.

```javascript
store.slot('nearbyDevices').muteAnnounce(nearbyDevices => {
  for (const deviceInfo of nearbyDevices) {     
  	// this changes fast and we don't need to announce on each such change besides this is not needed on frontend
    delete deviceInfo.lastSeenAt; 
  }
});
```

In the case of `dmt-proc` as nearby devices data comes in over local UDP packages we update state accordingly in realtime. All pieces of data are relevant and should trigger an immediate state `announce` on remotely connected GUIs except for one thing: `lastSeenAt`. We update this field everytime the data comes (which is frequently) and mostly the data from each particular nearby device is exactly the same — nothing changed. We still update `lastSeenAt` each time but we don't want this to cause state announce because it would do so each time. So this one omit makes a huge difference between a lot of unneccessary state announcements and no announcements at all when not needed.

And finally let's see what complete `SyncStore` state reading and updating API looks like:

### State reading and updating API 

#### Reading

```js
store.get(); // get the entire state

store.get('device'); // get the 'device' state: { name: 'myPC' }
store.key('device').get(); // same: { name: 'myPC' }
store.slot('device').get(); // equivalent to store.key()
```

### Removing slots

```js
store.slot('device').remove(); // removes the entire slots, announces state change
store.slot('device').remove({ announce: false }); // removes the entire slots, without announcing
```

### Removing keys from within slots

```js
store.slot('device').removeKey('name');
store.slot('device').removeKey('name', { announce: false });
```

### Setting the entire slot state

```js
store.slot('device').set({ name: 'myPC', platform: 'linux' });
store.slot('device').set({ name: 'myPC', platform: 'linux' }, { announce: false });
```
Will replace the entire `device` slot state with provided object.

### Updating  slot state

```js
store.slot('device').update({ name: 'myServer' });
store.slot('device').set({ name: 'myServer' }, { announce: false });
```
Will keep existing keys but add or replace the new values as provided (= merge).

### Array slots

If we define some slot as array with:

```js
store.slot('notifications').makeArray();
```

Then we **cannot use** `update` and `removeKey` anymore but we can use these new methods:

#### push(element, { announce = true } = {})

```js
store.slot('notifications').push({ msg: 'Hi!', expireAt: Date.now() + 30 * 1000 }); // expires in 30 seconds
store.slot('notifications').push(…, { announce: false }); // without announcing immediately
```

Calling this twice produces similar state to this:

```json
{
  "notifications": [
    {
      "msg": "Hi!",
      "expireAt": 1655483073981
    },
    {
      "msg": "Hi!",
      "expireAt": 1655483104717
    }
  ]
}
```

#### updateArrayElements(selectorPredicate, value, { announce = true } = {})

```js
const predicate = ({ expireAt }) => expireAt < Date.now();
store.slot('notifications').updateArrayElements(predicate, { expired: true });
```

#### removeArrayElements(selectorPredicate, { announce = true } = {})

```js
store.slot('notifications').removeArrayElements(({ expired }) => expired); // remove expired notifications from array
```

#### replaceArrayElement(selectorPredicate, value, { announce = true } = {})

This method returns true if found match.

This is rarely used, actually only used once withing `dmt-proc` for managing `nearbyDevices` slot withing process state:

```js
export default function updateDeviceInList({ device, program, announce }) {
  const slotName = 'nearbyDevices';

  const selectorPredicate = ({ deviceKey }) => deviceKey == device.deviceKey;

  if (!program.store(slotName).replaceArrayElement(selectorPredicate, device, { announce })) {
    program.store(slotName).push(device, { announce });
  }
}
```

`replaceArrayElement()` method will try to find the correct device (at most one element of array) and then replace it with received data. If it cannot find the correct element, it will return false and we then know we need to add (`push`) this device information because we received it for the first time.

Now that we know all the interesting things about core state management and persisting the state, let us now delve into how state syncing over remote channels works.

#### setArrayElement(selectorPredicate, value, { announce = true } = {})

[todo]

#### sortArray(compareFn, { announce = true }) {

[todo]

### Syncing state over Connectome

It is just one method:

```
store.sync(channels);
```

Read more about [Connectome](https://github.com/uniqpath/connectome) and how to actually connect from remote GUIs to `SyncStore`.

[ Improved and updated Connectome docs are in development → soon → June 2022 ! ]

