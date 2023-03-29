## DMT NOTIFIERS

DMT notifiers are special functions that can be imported from `'dmt/notify'` module.

```js
import { dateNotifier, dailyNotifier, weeklyNotifier, yearlyNotifier } from 'dmt/notify';
```

We usually do this inside our **DMT User Engine** (`~/.dmt/user/engine`) on our **mainDevice**.

The most elegant approach is to put the code utilizing these functions inside the `notifications` subdirectory.

```
mkdir -p ~/.dmt/user/engine/notifications && cd $_

nano medication.js
```

`medication.js` file contents ↴

```js
import { isMainServer } from 'dmt/common';

import { push, dailyNotifier } from 'dmt/notify';

const title = 'Medication'; // default title
const symbol = '💊'; // default symbol

const notifications = [
  { msg: 'John — antibiotic', until: '13.11.2022', when: ['7:30', '14:30', '22:15'], warnAfter: 15 },
  { msg: 'Mary — antibiotic', from: '10.11.2022', until: '20.11.2022', when: ['8:00', '20:00'], warnAfter: 15 },
  { msg: 'Kids — Vitamin D', title: 'VITAMINS', when: ['19:55'], symbol: '🍊' }
];

export function init(program) {
  dailyNotifier(notifications, { program, title, symbol })
    .scopeDevice(() => isMainServer() || program.isHub())
    .handleNotification(({ msg, title, pushTitle }) => {
      if (isMainServer()) {
        push.title(pushTitle).notify(msg);
      } else {
        program.nearbyNotification({ msg, title, ttl: 120, omitDeviceName: true, color: '#3091AB' });
      }
    });
}
```

In such simple non-customized cases we can also use shorthand:

```js
export function init(program) {
  dailyNotifier(notifications, { program, title, symbol, color: '#3091AB' });
}
```

This will do exactly the same as you can check [here](https://github.com/uniqpath/dmt/blob/main/core/node/notify/lib2/lib/defaultNotifier.js).

If you want to send push notification to all users in default push notifications group (read more [here](./PUSH_NOTIFICATIONS.md)) then you can use:

```js
export function init(program) {
  dailyNotifier(notifications, { program, title, symbol, color: '#3091AB' }).all();
}
```

this would be equivalent to:

```js
...
if (isMainServer()) {
  push.title(pushTitle).notifyAll(msg);
}
...
```

when done manually... with one small difference, defaults also hook up the `tagline` argument as you can check in [already mentioned resource](https://github.com/uniqpath/dmt/blob/main/core/node/notify/lib2/lib/defaultNotifier.js). If you need customization and want this 'candy' as well, then use the `tagline` passed argument in similar way as in `defaultNotifier.js` source.

We will look into the API of `dailyNotifier` (and other notifiers) in detail a bit later, for now let's focus on general principles and a few core ideas.

💡 **notifications** can be a nested hiearchical array, it always gets flattened into one-dimensional array, these are valid:

```js
const notifications = [{ msg: 'TEST', title: 'TITLE', when: ['8:30', '20:30'], symbol: '🚀' }];
```

or

```js
const vitamins = [{ msg: 'Kids — Vitamin D', title: 'VITAMINS', when: ['19:55'], symbol: '🍊' }];

const antibiotics = […];

const notifications = [vitamins, antibiotics, …];

// and then as before:

dailyNotifier(notifications, { program, title, symbol, color: '#3091AB' });
```

### One time preparation

Before we continue there are a few more preparatory — do only once — things:

#### Define mainServer

1) Open `device.def` of your server device and add this flag:

```
device: server

  mainServer: true
```

it is similar like the `mainDevice` flag (your PC where you run `dmt next` on and edit your user engine).

If you have multiple servers decide on one of them to become `mainServer`. It should usually be the most reliable one where `dmt-proc` is rarely down.

#### loadDirectory

2. We need to tell our user engine to load all files inside the `notifications` subdirectory. DMT `program` instance offers a nice function for this — `program.loadDirectory()`.

Open `~/.dmt/user/engine/index.js` in your favourite editor and put these lines near the top:

```js
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

Then add one line somewhere inside the `init` function:

```js
export function init(program) {
  …
  program.loadDirectory(path.join(__dirname, 'notifications'));
  …
}
```

Done! This will automatically load any new files that you put inside that directory provided that they:

- export a default function
- or export a function called `init`

This function will then receive the only argument — `program` instance exactly as we observed above in `medication.js` example file.

💡 If you want to disable any file and temporarily prevent it from loading just add suffix `--disabled` to the end, like this:

```
mv medication.js medication--disabled.js
```

`loadDirectory` function will now ignore this file until you remove this suffix.

In essence if you don't have currently anything else inside your User Engine then the entire file `~/.dmt/user/engine/index.js` looks like this:

```js
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function init(program) {
  program.loadDirectory(path.join(__dirname, 'notifications'));
}
```

#### Setting the correct timezone on the server

3. Use the `timedatectl` on your server to set the same timezone that your `mainDevice` uses so that you will receive notifications at correct times.

   The exact command is `sudo timedatectl set-timezone <your_time_zone>`. 

   You can list the available timezones with `timedatectl list-timezones`.

   Read more [here](https://linuxize.com/post/how-to-set-or-change-timezone-in-linux/).

### Core logic of DMT notifiers

All notifiers are set up like this:

```js
daily|weekly|yearly|dateNotifier(notifications, { program, ... })
  .scopeDevice(...)
  .handleNotification(({ msg, title, symbol, ... }) => {
		...
  });
```

1. `xyzNotifier` is a function that accepts a list of notifications or rather records describing events that later become notifications (push or nearby). Second argument is object with: `program` instance and some more optional elements depending on the notifier.

2. `scopeDevice` is the first method we call on the result of notifier function. This function accepts one of the following: a) a list of device names OR b) a function which is continuosly executed to determine if current device is the correct device to handle these specific notificactions.

   ```js
   .scopeDevice('myPC')
   .scopeDevice(['myPC', 'myRPi'])
   .scopeDevice(isMainDevice)
   .scopeDevice(isMainServer)
   .scopeDevice(() => isMainDevice() || isMainServer())
   .scopeDevice(() => isMainServer() || program.isHub())
   ```

3. Next in the chain we call `handleNotification` and provide it with the callback which will accept a few arguments, notably `msg, title, symbol` which we then use to actually send out the correct type of notification (one or more) for our purposes. We usually use `mainServer` for push notifications and our local network `hub` (usually a RaspberryPi device) on special IP address `192.168.0.20` to broadcast `nearbyNotifications` to all the other local dmt processes.

⚠️ In the current architecture you have to always `dmt update` one or more devices (server, hub ...) as you add or change your notification list.

# API

## 📅 dateNotifier

This notifier is used for **one-time specific events** and not periodic events like all the rest of notifiers.

It can be thought of like a regular calendar that is edited in code (until GUI solutions are implemented).

```js
import { dateNotifier } from 'dmt/notify';

const symbol = '📅';

const list = [
  { title: 'Dentist', when: ['10.12.2022 at 13:00', '20.12.2022 at 11:00'], symbol: '🦷' },
  { title: 'Exams', when: ['1.5.2022 15:00', '15.5.2022 17:30'], symbol: '💯' },
  { title: 'Party', when: ['2022/12/31 20:00'], symbol: '🥳' } // this date format also works!
];

export function init(program) {
  dateNotifier(list, { program, symbol });
}
```

Each item in our data structure (`list`) has:

- `title` string

  Representative string of our event, typically exact event name.

- `when` array

  An array of one or more strings with exact timepoints for the event(s).

  Format is: `dd.MM.yyyy H:mm` or `dd.MM.yyyy at H:mm`, the `at` word is optional and can be used for better readability.

  Alternative formats are: `yyyy/MM/dd H:mm` and `yyyy-MM-dd H:mm`.

  💡 You can also use 12-hour time format everywhere, for example:

  ```js
  const list = [
    { title: 'Dentist', when: ['10.12.2022 at 1pm', '20.12.2022 at 11am'], symbol: '🦷' },
    { title: 'Exams', when: ['1.5.2022 3:00pm', '15.5.2022 5:30pm'], symbol: '💯' },
    { title: 'Party', when: ['2022/12/31 8pm'], symbol: '🥳' } // this date format also works!
  ];
  ```

- `symbol` string 

  Custom symbol for each event, otherwise default one is used if provided. 

- `color` string (example: `"#ccddee"`)

  Color of nearby notification.

  ```js
  const list = [
    { title: 'Event', when: ['1.5.2022 at 12:00'], color: '#00EE33' } // use this color for nearby notification
  ];
  ```

- `ttl` integer

  Time to live for the nearby notification (in seconds).

  ```js
  const list = [
    { title: 'Event', when: ['1.5.2022 at 12:00'], ttl: 300 } // show for 5 minutes
  ];
  ```

- `defaultTime` string

  If all listed events in one line are at the same time, we can do this:

  ```js
  const list = [
    { title: 'Lectures', when: ['1.5.2022', '15.5.2022', '30.5.2022'], defaultTime: '12:15' }
  ];
  ```
  
  If `defaultTime` is not provided then "default" defaultTime for every event in `dateNotifier` is `8:00`.
  
- `notifyMinutesBefore` integer

​	How much time in minutes before the event will the notification come. Default is immediately (value = 0).

```js
const list = [
  { title: 'Lectures', when: ['1.5.2022 12:15'], notifyMinutesBefore: 30 } // notify 30 min before the event
];
```

## Options for invoking `dateNotifier`:

- `defaultYear`

```js
const symbol = '📅';
const defaultYear = 2022;

const list = [
  // 1.5.2022 at 12:15, 15.5.2022 at 12:15, 30.5.2022 at 12:15, 5.6.2022 at 13:15 ↴
  { title: 'Lectures', when: ['1.5', '5/15', '5/30', '5.6 at 13:15'], defaultTime: '12:15' },
  { title: 'Exam', when: ['1.1.2023 at 8:00'] } // be careful to correctly specify events that are *not* in 2022 default year
];

export function init(program) {
  dateNotifier(list, { program, symbol, defaultYear });
}
```

- `color`

  Default color for all notifications for this dateNotifier except when specified on each event as shown above.

  ```js
  const symbol = '📅';
  const color = '#DD0044';
  
  const list = [
    { title: 'Lectures', when: ['5.6.2022 13:15'], color: '#00EE33' },
    { title: 'Exams', when: ['5.6.2022 13:15'] } // will use #DD0044 default color
  ];
  
  export function init(program) {
    dateNotifier(list, { program, symbol, color }); // we pass the default color in here in the same way as symbol and ttl
  }
  ```

- `ttl`

  Default ttl:

  ```js
  const symbol = '📅';
  const ttl = 60;
  
  const list = [
    { title: 'Lectures', when: ['5.6.2022 13:15'] }, // will use 60s ttl
    { title: 'Lectures', when: ['5.6.2022 13:15'], ttl: 180 }
  ];
  
  export function init(program) {
    dateNotifier(list, { program, symbol, color }); // we pass the default ttl in here in the same way as symbol and color
  }
  ```

  Global default `ttl` if we provide neither here is `120s`.

- `notifyMinutesBefore`

  ```js
  import { dateNotifier } from 'dmt/notify';
  
  const symbol = '📅';
  
  const notifyDayBeforeAt = ['17:00', '20:00'];
  const notifyMinutesBefore = 30;
  
  const list = [
    { title: 'Dentist', when: ['10.12.2022 at 13:00', '20.12.2022 at 11:00'], symbol: '🦷' },
    { title: 'Exams', when: ['1.5.2022 15:00', '15.5.2022 17:00'], symbol: '💯' },
    { title: 'Party', when: ['31.12.2022 20:00'], symbol: '🥳' }
  ];
  
  export function init(program) {
    dateNotifier(list, { program, symbol, notifyDayBeforeAt, notifyMinutesBefore });
  }
  ```

  Default `notifyMinutesBefore` for all events in the list. Here we would receive notifications 30 minutes before each event (and not at the event time itself). To receive notifications at exact times of events don't use `notifyMinutesBefore` option or set it to `0`.

- `notifyDayBeforeAt`

  We can also receive a notification announcing our event the day before it happens. We provide a list of one or more times when this should happen. In example above we would receive two notifications (at 17h and 20h) one day prior.

  We can also just use string if we only need one notification on the previous day:

  ```js
  const notifyDayBeforeAt = '17:00';
  const notifyMinutesBefore = 30;
  
  export function init(program) {
    dateNotifier(list, { program, symbol, notifyDayBeforeAt, notifyMinutesBefore });
  }
  ```

## Options inside handler

If we are handling notification triggers ourselves for better clarity and customization it would look something like this:

```js
import { dateNotifier } from 'dmt/notify';

const symbol = '📅';
const title = 'Lectures';

const list = [
  { title: 'Lectures', when: ['5.6.2022 13:15'], color: '#ffeedd', symbol: '🎓' },
  { title: 'Exams', when: ['5.6.2022 13:15'], ttl: 180 }

export function init(program) {
  dailyNotifier(notifications, { program, title, symbol })
    .scopeDevice(() => isMainServer() || program.isHub())
    .handleNotification(({ msg, title, pushTitle, color, ttl, tagline, isDayBefore }) => {
      if (isMainServer()) {
        push.title(pushTitle).notify(msg);
      } else if (!isDayBefore) { // only display dmt-native nearbyNotifications on the day of event
        program.nearbyNotification({ msg, title, ttl, replaceTtl: tagline, omitDeviceName: true, color });
      }
    });
}
```

Returned parameters are:

- `title`, `symbol`, `color`, `ttl`

  These should be clear, we get the correct value based on default values and values specified at each notification entry.

- `pushTitle`

  This makes it easier to send out the correct title for push notifications. It will consist of `symbol`, `title` and `tagline`.

- `isDayBefore` boolean

  The `true | false` value of this parameter tells us if current notification is triggering for event that is tomorrow (at `notifyDayBeforeAt` times) or is actually triggering for the event that is soon (today) `notifyMinutesBefore` minutes before the actually specified time.

  Sometimes we might to customize our notifications based on this. In the example above we choose not to display `nearbyNotifications` for the day-before notifications.

- `tagline` when it is less than `2h` before the event this argument will have a nice description like `in 30 min`. We can include this in our notifications. Special `replaceTtl` option for `nearbyNotifications` replaces the bottom line of notification that usually displays seconds active with our custom message. In our events here we are much more interested in this information (that event is happening in some time) than seconds since notification came up.

  💡in case we don't customize our notifier handler and just do this:

  ```js
  export function init(program) {
    dailyNotifier(notifications, { program, title, symbol });
  }
  ```

  Then the `tagline` parameter will be hooked up exactly like shown above. You can observe the source code for this [here](https://github.com/uniqpath/dmt/blob/main/core/node/notify/lib2/lib/defaultNotifier.js).

# Periodic notifiers

`dateNotifier` is very useful for important events that we want to be notified of but **periodic notifiers** are greater still because they show the real power of automation. We enter them only once and they remind us **daily**, **weekly**, **monthly** or **yearly** ... forever or until deadline has passed. This angle goes very well with the general philosophy of **DMT SYSTEM** — use computers for reliable deterministic tasks that free your brain and let you be more creative with *other stuff*. Reminders will tell you when you need to take a break from your flow and do the required thing. They are like brain interrupts :) Nobody likes to be interrupted but of course we have to do important things and if we have to have them in our mind constantly then we are actually interrupting our flow all the time and cannot really focus.

## 🔁 dailyNotifier

`dailyNotifier` is great for recurring daily events, usually for these that last a few days, weeks or months.

One great use case is medication reminders — again, for mediaction we take regularly or perhaps even more useful for medication that is prescribed for a few days or weeks. These are the most problematic because when we get these, it's something new in our life that we have to think about. It is better to automate these reminders so our head is less full and we can focus on things that matter more, for example programming DMT SYSTEM.

```js
import { isMainServer } from 'dmt/common';

import { push, dailyNotifier } from 'dmt/notify';

const title = 'Medication'; // default title
const symbol = '💊'; // default symbol

const notifications = [
  { msg: 'John — antibiotic', until: '13.11.2022', when: ['7:30', '14:30', '22:15'], warnAfter: 15 },
  { msg: 'Mary — antibiotic', from: '10.11.2022', until: '20.11.2022', when: ['8:00', '20:00'], warnAfter: 15 },
  { msg: 'Kids — Vitamin D', title: 'VITAMINS', when: ['19:55'], symbol: '🍊' }
];

export function init(program) {
  dailyNotifier(notifications, { program, title, symbol })
    .scopeDevice(() => isMainServer() || program.isHub())
    .handleNotification(({ msg, title, pushTitle, tagline }) => {
      if (isMainServer()) {
        push.title(pushTitle).notify(msg);
      } else {
        program.nearbyNotification({ msg, title, ttl: 120, replaceTtl: tagline, omitDeviceName: true, color: '#3091AB' });
      }
    });
}
```

or if no very specific customizations are needed:

```js
export function init(program) {
  dailyNotifier(notifications, { program, title, symbol });
}
```

to push-notify all users instead of just main user:

```js
export function init(program) {
  dailyNotifier(notifications, { program, title, symbol }).all();
}
```

Notification data structure element arguments:

- `msg` string

  `dailyNotifier` is the only notifier where we can specift `msg` in addition to `title`. 

  The reason is clear: this notifier doesn't announce future events but each event exactly at the time specified. Because of this we don't need additional screen space to display things like `Tomorrow at 3pm` and it frees the space for more information, two lines in this example. 

- `title` string

  Top line in push and DMT-native notifications, usually a group of things with `msg` being a more specific exact thing / event / reminder.

- `when` 

  Time for events.

- `warnAfter` integer

  If we want a second notification for each event after a specific number of minutes we use this parameter. This notification will always use the ⚠️ symbol to depict it is a second (and final) message about some event on that particular time.

- `pushTitle, symbol`, `color`, `ttl` — please see above (`dateNotifier`) for explanation, it is the same here

- `from` string

  We can notifications that should start happening some time in the future, example:

  ```js
  const notifications = [
    { msg: 'Some event', from: '1.9.2022', when: ['8:00', '20:00'] }
  ];
  ```

  If today is still `august of 2022` then these reminders won't start coming. After `first of september` they will turn on and keep coming until removed.

- `until` string

  It is more customary and useful to use the `until` option instead of `from` (or use them both sometimes), example:

  ```js
  const notifications = [
    { msg: 'Take antihistamine', title: 'Medication', until: '13.11.2022', when: ['7:30', '14:30', '22:15'] },
    { msg: 'Mary — antibiotic', title: 'Medication', from: '10.11.2022', until: '20.11.2022', when: ['8:00', '20:00'] }
  ];
  ```

  If we do this (omitting the year):

  ```js
  const notifications = [
    { msg: 'Take antihistamine', title: 'Medication', from: '20.3', until: '21.6', when: ['8am', '8pm'] }
  ];
  ```

  Then we have a daily reminder that activates each year between these dates and runs the entire (nothern hemishpere) spring.

  💡 `from` and `until` support one more option, like this:

  ```js
  const notifications = [
    { msg: 'Go for a run', title: 'Sport', from: 'apr', until: 'sep', when: ['5am'], symbol: '🏃' }
  ];
  ```

  or (for winter months for example)

  ```js
  const notifications = [
    { msg: 'Take Vitamin D', title: 'Health', from: 'oct', until: 'mar', when: ['10pm'], symbol: '🌞' }
  ];
  ```

  ## Options for invoking `dailyNotifier`:

  - `title` string

    Default title that will be used if none is provided on the notification entry itself in the list.

  - `symbol`, `color`, `ttl`

    Similar to above and please see the description above in `dateNotifier` because the meaning is the same.

  - `warnAfter`  integer

    How many minutes until second reminder arrives. Same concept, if there is no value on the entry itself, this one will be used. 

    If there is no `warnAfter` value in either place then there will be no second warning notification.

    System will only send reminders at the exact time once for each reminder timepoint.
    
## Options inside handler

Returned parameters are:

- `title`, `pushTitle`, `symbol`, `color`, `ttl`

  These should be clear, we get the correct value based on default values and values specified at each notification entry.

- `tagline` daily notifier uses this a little bit differently than `dateNotifier` but we still show it in the same place. In the case of daily notification running out because of `until` argument then this parameter will show information every 5 days, like this:

`💊 PILL (10 more days)`
`💊 PILL (5 more days)`
`💊 PILL (1 more day)`
`💊 PILL (last day)` or 
`💊 PILL (finished)` (for last event on last day)

And native DMT notifications will include this in their status line instead of seconds counter.

  💡in case we don't customize our notifier handler and just do this:

  ```js
  export function init(program) {
    dailyNotifier(notifications, { program, title, symbol });
  }
  ```

  Then the `tagline` parameter will be hooked up exactly like shown above. You can observe the source code for this [here](https://github.com/uniqpath/dmt/blob/main/core/node/notify/lib2/lib/defaultNotifier.js).

## 🔁 weeklyNotifier

`weeklyNotifier` is great for recurring weekly events that don't happen every day but happen on same days of the week, for example `tuesdays` and `fridays`.

```js
import { push, weeklyNotifier } from 'dmt/notify';

import { isMainDevice, isMainServer } from 'dmt/common';

const list = [
  { title: 'Tenis', when: ['TUE 16:00', 'THU 16:00'], symbol: '🎾', color: '#D7D91A' },
  { title: 'Soccer', when: ['WED 18:15'], symbol: '⚽' }
];

const notifyDayBeforeAt = '21:00';
const notifyMinutesBefore = 60;

const color = '#3091AB';

export function init(program) {
  weeklyNotifier(list, { program, color, notifyDayBeforeAt, notifyMinutesBefore });
}
```

Overall usage is very similar to `dateNotifier`, the only difference is how we specify `times`.

```js
when: ['TUE 16:00', 'THU 16:00']
```

As you can see times is an array of strings and each element is `day-of-week` and then time.

Time can be in 24 or 12-hour format:

```js
when: ['TUE 4pm', 'THU 4pm']
```

