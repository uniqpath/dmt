## DMT NOTIFIER · Free your mind ™

**DMT notifier** is a powerful and flexible function that can be imported from `'dmt/notify'` module.

As many other parts of DMT SYSTEM `dmt notifier` can also radically improve your life by taking burden from your mind and let computer handle what it does best. 

Let's start with the most basic use of the API — create this `example.js` file in `~/.dmt/user/engine/_notifications` :

```js
import { notifier } from 'dmt/notify';

function init() {
  notifier({ title: 'Important notice', msg: 'Eat fruit', symbol: '🍒', when: ['9:00', '18:00'] });
}
```

💡 `~/.dmt/user/engine/_notifications` is loaded automatically and recursively, so you can have many subfolders and files to organize your notifications nicely, like: `_notifications/business`, `_notifications/maintenance`, `_notifications/kids`, etc.

Then copy the code to your `mainServer` designated device:

`dmt copy [myServer]`

**And that's it!** You will receive two notifications each day. This code has no effect on other devices except on `mainServer`.

<img src="https://raw.githubusercontent.com/uniqpath/info/master/assets/img/notifier_eat_fruit.jpg" style="zoom:33%;" />

Signature of the function looks like this:

```js
notifier(notifications, [options]);
```

Important points:

- you can pass in one or more notifications (as array)
- there are a few additional options that you can use, like `notifyDayBeforeAt` and `notifyMinutesBefore`.

Let us consider a tiny bit more complex example:

```js
import { notifier } from 'dmt/notify';

const notifyDayBeforeAt = '21:00'; // will send "announcement notification" one day before
const notifyMinutesBefore = 60; // notify one hour before the event instead of the actual event time

const list = [  
  { title: 'Judo', when: 'WED 17:00', symbol: '🥋' },
  { title: 'Tennis', when: ['TUE 16:00', 'THU 16:00'], symbol: '🎾', from: '1.3.2024', until: '30.6.2024' }
];

function init() {
  notifier(list, { notifyDayBeforeAt, notifyMinutesBefore });
}
```

- `notifyDayBeforeAt` — specify at what time one day before the event there will be an announcement pre-notification, can be array of multiple times
- `notifyMinutesBefore` — a lot of times we want to be notified one or more hours before the event... can be a number or array of numbers... if you use multiple numbers, you can also add 0 into the array to notify at the exact time of event as well 

⚠️ these two options have no effect on daily events (those where only hours are specified, like for example `17:00`). With daily events like these, we have another option instead called `warnAfter` which specifies how many minutes after the event a second reminder notification should arrive.

- `warnAfter` (work only with daily events) — how many minutes after the event a second reminder will be sent

```js
// will send an additional warning notification 15 minutes after original one (8:15, 20:15)
notifier({ title: 'Kids', msg: 'Give antibiotic', when: ['8:00', '20:00'], warnAfter: 15 })
```

#### Using exact dates

```js
import { notifier } from 'dmt/notify';

const list = [
  { title: 'Dentist', when: ['10.12.2022 at 13:00', '20.12.2022 at 11:00'], symbol: '🦷' },
  { title: 'Exams', when: ['1.5.2022 15:00', '15.5.2022 17:30'], symbol: '💯' },
  { title: 'Party', when: ['2022/12/31 20:00'], symbol: '🥳', notifyDaysBefore: [7, 2] }
];

export function init() {
  notifier(list);
}
```

- `notifyDaysBefore`  — you can notify multiple days before if you use exact dates, not just one day before the event (through `notifyDayBeforeAt`). For example: `[5,2,1]` will notify five, two and one day before the event...

## Notifying more people other than yourself

#### Program your family

If you have a default (usually family) group specified in your `pushover.def`:

```YAML
pushover:

  user: uAV9QsYRhaMzVNLcej8XDEAtqizYDJ
  group: goj229p1ta45j4bmhw7136sqscv7x4 
```

Then calling the notify function with `.all()` at the end you will notify the entire family:

```js
import { notifier } from 'dmt/notify';

const antibiotics = [
  { title: 'Kids', msg: 'Give antibiotic', when: ['8:00', '20:00'], warnAfter: 15, from: '10.4.2024', until: '20.4.2024', symbol: '🦠' }
];

export function init() {
  notifier(list).all();
}
```

#### Specific person

```js
import { notifier } from 'dmt/notify';

const user = 'Amy';

const antibiotics = [
  { title: 'L-theanine', msg: 'Take one dose for better alpha waves', when: ['17:00'], symbol: '🧠' },
  { title: 'Magnesium glycinate', msg: 'Better sleep', when: ['21:00'], symbol: '😴' }
];

export function init() {
  notifier(list, { user });
}
```

You can also specify separate user on each entry instead:

```js
const title = 'Medication';
const symbol = '💊';

const medicines = [
  { msg: 'Take some pills', when: ['8:00', '20:00'], user: 'Amy' }, // we now specify user on each notification entry
  { msg: 'Take some other pills', when: ['8:00', '20:00'], user: 'Mike' }
];

const otherStuff = [ ... ];

export function init() {
  notifier([medicines, otherStuff], { title, symbol }); // we can also pass title and symbol as default options
}
```

This supposed that you have Amy's pushover key listed in your `pushover.def`, like this:

```yaml
pushover:

  user: uAV9QsYRhaMzVNLcej8XDEAtqizYDJ
  group: goj229p1ta45j4bmhw7136sqscv7x4 
  
  app: ...
  app: ...
  
  users:
    mike: uJV9QsYRaiMzVNLcej8YDEAtaizYDA
    amy: ubyj59h14d6ywyh11ngqpa2g5ttseb
    lisa: ux2rde8a2bqe4g14s7fc4mhae5w82C
```

❗ Use only lowercaps in `pushover.def` for user names... while in code you can use mixed cases (it will all be converted to lowercase).

## Supported formats for `when`:

Each notification entry has `when` parameter which can be a simple string or an array of strings. It has to be one of these:

- `10:20`, `2pm`, `1am` — these notifications will arrive each day
- `MON 2pm`, `WED 15:00` — notifications will arrive weekly on specific days
- `10.12.2022 at 13:00`, `15.5.2022 17:30`, `2022/12/31 8pm` — notifications will arrive at exact days specified
- `1.3.`, `20.5.`, `30.10. at 13:30` — notifications will arrive each year on these dates (and times)
- `3x monthly` — notifications will arrive 3x each month at random days between 8am and 8pm, more or less spread through the month
-  `7x monthly at 20:00` — notifications will arrive 7x per month at exact time specified, spread through the month
-  `2x weekly` — notifications will arrive twice per week at random days between 8am and 8pm
-  `3x weekly at 5pm` — notificartions will arrive 3 times weekly at random days at 17:00 (5pm)

```js
{..., when: ['8:00', '15:00', '20:00'] }; // each day at these times
{..., when: ['WED 15:00', 'SAT 15:00', 'SAT 20:00'] }; // every wednesday (once) and saturday (twice)
{..., when: ['1.5.2024', '1.5.2025', '1.5.2026'] }; // first of may 2024, 2025, 2026
{..., when: ['1.6.', '2.6.'] }; // every year first and second of june
{..., when: '7x monthly' }; // on random days 7x per month
{..., when: '2x weekly' }; // on random two days each week
etc.
```

## FROM and UNTIL

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


### Add some unpredictability

```js
import { notifier } from 'dmt/notify';

// a list of a few books that you are currently reading
const books = ['Awareness by Anthony de Mello', 'Finite and Infinite Games by James P. Carse', 'The Quark & the Jaguar by Murray Gell-Mann']; 

export function init() {
  notifier({ title: 'Just a reminder to read', msg: books, when: '10x monthly at 20:00', symbol: '📖' });
}
```

This is a very interesting notifier that recommends one book from the list to read approximately every third day.

Just to remind you a) that reading is important b) about specific books you decided are important to you currently.

💡 Same approach works also with `title` and `symbol` — they can both be arrays and in this case one element will be chosen randomly each time.

### Even more freedom when needed

```js
import { push, notifier } from 'dmt/notify';

import { isMainDevice } from 'dmt/common';

function init() {
  notifier({ title: 'Important notice', msg: 'Eat fruit', symbol: ['🍊', '🍎', '🍒'], when: ['9:00', '18:00'] })
    .scope(isMainDevice)
    .handle(({ msg, title }) => push.title(title).notify(msg));;
}
```

This will now send notifications from `mainDevice` instead of `mainServer` (can be useful for testing etc.)

If you want to do some custom things before sending notification then this is done as shown with `.handle` function which receives a callback.

#### ❗Setting the correct timezone on your server

Use the `timedatectl` on your server to set the same timezone that your `mainDevice` uses so that you will receive notifications at correct times.

The exact command is `sudo timedatectl set-timezone <your_time_zone>`. 

You can list the available timezones with `timedatectl list-timezones`.

Read more [here](https://linuxize.com/post/how-to-set-or-change-timezone-in-linux/).

#### 💡 Updating notifications

If DMT version didn't change, then you can always use `dmt copy` instead of `dmt update` to bring your updated notifications to the server.

Just keep in mind the following: **notifications are re-read on each full minute**. If you have a notification that should happen at `15:00` and you issue `dmt copy [server]` at `15:00:00` or `15:00:20` etc. then this notification won't be sent because it will be loaded into the system at `15:01:00` (at each full minute).

If you used `dmt update` in this case and process managed to be ready again at or before `15:00:59` (so it's still technically 15:00), then notification will be sent.

This is only important when testing ... usually it's perfect to just `dmt copy` things over and they will work as intented,

⚠️ Do not put any other code inside `_notifications` which may leave instantiated objects after reload (for example timers and intervals etc.). Notifier function is designed so that it cleans everything up on soft reload (when doing `dmt copy`). Best rule is to only use one or more `notifier(...)` functions inside each `init()` function and nothing more.
