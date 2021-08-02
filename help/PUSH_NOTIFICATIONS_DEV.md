## Push notifications for Developers

### DMT Push Notifications API

DMT apps or scripts in DMT USER ENGINE can use this code to send a push notification to their owner:

```js
import { push } from 'dmt/notify';

push.notify('HI!');
```

This sends a message through the default dmt pushover app (the one with `app: dmt` in `pushover.def`).

### Important concepts

- Each DMT SYSTEM (a set of users devices) is tied to one Pushover account
- Pushover account provides you with User Key and allows you to create Pushover Applications and Delivery Groups
- Pushover applications are transmitters of messages with customizable look of notifications and each with 10.000 free push messages monthly
- Each message sent out through pushover uses one of applications API tokens and is delivered either to one user or to Delivery Group
- Delivery Group is just a list of users (each with their own Pushover User Key)

DMT Pushover integration implements all of this through [MessageSender](https://github.com/uniqpath/dmt/blob/main/core/node/notify/lib/pushover/messageSender.js) object.

### High priority messages

```javascript
push.highPriority().notify('Important!');
```

High priority messages will produce sound and be colored red in pushover app.

### Using named delivery groups

```
pushover:
  ...
  
  app: foo
    token: a8kog2np8viz4jmm17ev93tmosp89k

    group: red
      token: g1xf961e396afdto1u3nqi6cxb63mv

    group: blue
      token: gcxf961e396afdto1u3nqi6cxb63mw
```

Tokens for `red` and `blue` group correspond to delivery groups on pushover.net website, group names can match `red` and `blue` or not, what is important is `token`.

Now we can deliver push messages through `foo` app to different groups of people / devices:

```js
push.app('foo').group('red').notify('Red is a color');
push.app('foo').group('blue').notify('Blue is also a color');
```

`notifyAll` does not make sense in this case. 

💡 Use `push.notifyAll()` only in this simple notion with maybe variant like `push.title('title').notifyAll(...)` but not as part od `push.app(...)` semantics. `notifyAll` basically means delivery through default `dmt` pushover app to all users in default pushover group.

Reminder:

```
pushover:

  user: uJV6QsYRhiMzCNLcej8XDaAtqazYDJ
  group: guh428p1ta45j4bmhw1536sqsuv7x2 # default delivery group for notifyAll() command... usually Family members
```

### Examples

#### Send a message through any pushover app

1. Send a message through `Zeta` pushover app to the user / admin of the individual DMT SYSTEM.

```js
push.app('zeta').notify('executed search xyz');
```

2. Send a message with specific title:

```javascript
push.app('zeta').title('TITLE').notify('executed search xyz');
```

3. Send the same message to default delivery group (for example family - as defined in `group: [token]` under root `pushover.def` key):

```js
push.app('zeta').title('TITLE').notifyAll('executed search xyz'); // sends to everyone in default group
```

#### Use more groups

1. Send message 

```js
push.app('zeta').group('explorers').title('TITLE').notify('executed search xyz');
```

Corresponding `pushover.def` would look like this:

```
pushover:
  ...
  
  app: zeta
    token: ...

    group: explorers
      token: ...
```

#### Send to specific user

```javascript
push.userKey('uAV5QsxBhiMzANLbaj4XDaAtqazYMF').notify('HEY!');

push.app('zeta').userKey('uAV5QsxBhiMzANLbaj4XDaAtqazYMF').notify('HEY!');
```

### Testing 

Use your **DMT USER ENGINE** capabilities:

try adding this 

```js
import { push } from 'dmt/notify';

function init(program) {
  push.app('zeta').group('explorers').notify('TEST');
}
```

to `~/.dmt/user/engine/index.js`.

Of course make sure that on [pushover.net](https://pushover.net) you have created `zeta` pushover app as described in [PUSH_NOTIFICATIONS](PUSH_NOTIFICATIONS.md) and also `Zeta Explorers` Delivery Group.

## Advanced

If you have your home network defined in `~/.dmt/user/def/networks.def` like this:

```
network: my_home

  latlng: 44.6415, 15.263889
  country: si
```

then you can add the following to one or more stationary devices' `device.def` on your home LAN:

```
device: some_device

  network: my_home
```

Devices will broadcast this network identifier on LAN via UDP and any other (mobile or other) devices on the same LAN will know their exact location.

They will show the correct sunrise/sunset info on DMT home screen for example.

Network identifier is used in push messages as well so they are titled `some_device @ my_home`, you can try this out easily.

For IoT use where messages come from small devices like Sonoff range and they are delivered over mqtt to one DMT IoT gateway, then it is not important for such push messages to have the name of the gateway on them, for example this is not needed:

_living-room @ my_home_
**Doorbell Ring**

This is enough:

_my_home_
**Doorbell Ring**

For this purpose the DMT / IoT middleware uses one last option —  `omitDeviceName()` — that you may want to know about:

```javascript
push.omitDeviceName().notify('Doorbell Ring');
```

### More examples

Omitting the device name can be useful in other cases as well, for example when integrating DMT with more general services and sending out push messages to groups of users like for example:

```javascript
push.app('cryptoschool').title('Cryptoschool 123').group('meetups').notify('Yet another meetup!');
```

If you don't specify `title` then `cryptoschool · device_name` will be used for push message title. If you want to only use app name (= `cryptoschool`) as title you can do this:

```
push.app('cryptoschool').omitDeviceName().group('meetups').notify('Yet another meetup!');
```

Adding `url` and `urlTitle`... try it out:

```javascript
push.app('cryptoschool').omitDeviceName().group('meetups').url('https://example.com').urlTitle('CLICK HERE FOR MEETUP').notify('Yet another meetup!');
```

Url will be displayed inside Pushover mobile client, more about this [here](https://pushover.net/api#urls).

