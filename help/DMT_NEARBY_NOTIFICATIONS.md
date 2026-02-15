## DMT (Nearby) Notifications

DMT Notifications are powerful system-native concept independent of any outside technology or resource. They work greatly in tandem with push notifications which get delivered to the phone instead through pushover.net servers.

The basis for this functionality is actually `program.showNotification(...)` function and its signature corresponds to that of `program.nearbyNotification(...)`.

We can utilize `showNotification` on any device and it will show DMT-native notification on that device (in DMT Frontend).

If we want to show a notification on all (or some, more about that later) nearby devices on the same local-area network then we utilize `nearbyNotification` function. We usually send these notifications from the `hub` device since we need to send them from just one device and hub is usually the most suitable for this.

Arguments common to `showNotification` and `nearbyNotification`:

(all except `msg` are optional)

**title** string

Title on the notification (along with device name which is displayed automatically).

**msg** string

Main content of the notification to display.

**ttl = 30** integer

Time to live in seconds.

**color = '#FFFFFF'** string

Background color of the notification, default is white. Foreground (text) color is determined automatically for greatest contrast. 

Cannot use values like `red`, `blue`, `white` etc `(for now?)`.

**group** string

Only needed in case we expect additional notifications before old ones are expired so that there are no multiple notifications visible at the same time.

Make this value unique. Every time an existing notification with the same group is still active it will first be cleared so that only the latest one is visible.

Also used in case we want to clear notifications before they are expired (see `program.clearNearbyNotification(group)` below). This is done rarely.

**omitDeviceName = false** boolean

Hide the notification originator device name.

**omitDesktopNotification = false**

In case `mainDevice` is displaying the notification inside the DMT frontend it will also display a desktop notificaion (macOS and Linux).

If you don't want this set this argument to `true`.

**omitTtl = false** boolean

Do not display time-to-live countown inside the notification.

**replaceTtl** string

Optional string to show instead of ttl (or rather seconds since notification was shown) — bottom line in notifications.

Some notifications can use this position very well, for example if notification is telling us when something _will happen_ instead of how many seconds ago _it happened_.

**dev = false**

If you pass `true` here then this notification will only be shown on devices that have the `devPanel: true` flag inside their `device.def`.

#### nearbyNotification spefic

**devices = []**

A list of target devices (their device names) to display notification, the rest of nearby devices will ignore such notifications.

Example: `program.nearbyNotification({ msg: 'hi', devices: ['panel1', 'panel2'] })`.

### program.clearNearbyNotification(group)

This method will remove all visible nearby notifications for some group (string).
