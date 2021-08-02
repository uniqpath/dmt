## Push notifications

Every DMT device needs a simple way to send out push notifications.

We now have this through DMT / https://pushover.net/ integration. **Pushover** is a service that is free to use for 30 days and after this it is only $5 one time payment. They have been around since 2012 and have a stable service with good API.

> Each DMT device can send notifications to its owner **and/or** other people.

### DMT Push Notifications API

DMT apps or scripts in DMT USER ENGINE can use this code to send a push notification to their owner:

```js
import { push } from 'dmt/notify';

push.notify("HI!")
```

As a user of the system you don't need to use or know this, the only important thing is:

### How to set it up?

1. Go to [pushover.net](https://pushover.net), register if you haven't yet and then create "an Application" inside the web interfaface.
2. Call the application DMT and attach [this logo](https://uniqpath.com/dmt.png). Each Pushover application can deliver 10.000 free messages each month.

3. On your main device create this `.def` file:

```bash
nano ~/.dmt/user/def/pushover.def
```

with this contents:

```
pushover:

  user: [Your Pushover User Key]
  
  app: dmt
    token: [Your DMT Application API Token]
```

Example:

```
pushover:

  user: uJV6QsYRhiMzCNLcej8XDaAtqazYDJ
  
  app: dmt
    token: aPGRmnAgRgvk6YGQDZ27BhnxjRMX45
```

Now your DMT devices will start delivering interesting messages to you when noteworthy events happen.

Examples:

- device booting
- RaspberryPi overheating
- someone making searches in your Zeta node
- any IoT-related things

To separate out the push notifications for searches in your Zeta node you can create another Pushover app called **Zeta** with this [this logo](https://uniqpath.com/zeta.png).

Then update your `pushover.def` in such way:

```
pushover:

  user: uJV6QsYRhiMzCNLcej8XDaAtqazYDJ
  
  app: dmt
    token: aPGRmnAgRgvk6YGQDZ27BhnxjRMX45
    
  app: zeta
    token: a4HRnmBpRgbk3YAQBZ24AhnxiDIX12
```

### Adding a default group

In pushover interface there is an option to create "A Delivery Group".

Create one such group called "Family" (for example) and add a few members through their Pushover User keys, including yours.

Add group key to `pushover.def` like this:

```
pushover:

  user: uJV6QsYRhiMzCNLcej8XDaAtqazYDJ
  group: guh428p1ta45j4bmhw1536sqsuv7x2
  
  ...
```

Now all the code that internally uses 

```js
push.notifyAll("HI!")
```

Will deliver push messages to all members of your Family.

Examples are IoT notifications like "Doorbell ring" and others if you have set this up.

Admin notifications like "device booted" or "swap space low" etc. are only delivered to "user".

Zeta searches are also delivered through `push.notify()` call instead of `push.notifyAll()`.

