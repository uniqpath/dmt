## Push notifications for Developers

### DMT Push Notifications API

DMT apps or scripts in DMT USER ENGINE can use this code to send a push notification to their owner:

```js
import { push } from 'dmt/notify';

push.notify("HI!")
```

As a user of the system you don't need to use or know this, the only important thing is:

### How to set it up?

1. Go to [pushover.net](https://pushover.net), register if you haven't yet and then create "an Application" inside their web interfaface
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

To separate out the searches in your Zeta node you can create another Pushover app called **Zeta** with this [this logo](https://uniqpath.com/zeta.png).

Then update your `pushover.def` in such way:

```
pushover:

  user: uJV6QsYRhiMzCNLcej8XDaAtqazYDJ
  
  app: dmt
    token: aPGRmnAgRgvk6YGQDZ27BhnxjRMX45
    
  app: zeta
    token: a4HRnmBpRgbk3YAQBZ24AhnxiDIX12
```

