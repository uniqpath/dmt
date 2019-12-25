# Push notifications

⚠️⚠️⚠️ Preliminary ⚠️⚠️⚠️ More in `dmt-system v1.2`!

This is early beta, will improve in following ways:

**1.** We will release the simple open-source iOS app that you can install on your own device with private developer certificate and this will allow you to receive push notifications from your devices directly. You need Apple Developer account though.

**2.** We will look into Android version of this. If you want to help, write to info@uniqpath.com.

**3.** We will look into integration with services like pusher.com, airship, OneSignal etc. Not yet sure if they are useful for this use case.

**4.** **This is an open area of planning and research!** We may even consider putting a set of mobile apps (one per each dominating mobile platform) into App Stores. Apps will let you receive push notifications from your devices but they won't be free. You will still have an option to get your own developer account and make it a thing "between you and Apple", without middlemen. You will be able to use the exact same apps from the App Store privately through your own developer accounts.

## What can you do today if you are a developer

⚠️ Technical

As of now, if you do this:

`mkdir -p ~/.dmt/user/access_tokens/apple_push`

and create these files:

```
AuthKey.p8
config.json
notify-development-push.pem
```

`config.json` should look similar to this:

```
{
  "server_auth": {
    "token": {
      "key": "./AuthKey.p8",
      "keyId": "<appleKeyId>",
      "teamId": "<appleTeamId>"
    },
    "topic": "com.uniqpath.notify" (change this to match your app)
  },

  "devices": [
    {
      "name": "Your name",
      "token": "<your apple push notifications token>",
      "admin": true
    },
    {
      "name": "Family member 1",
      "token": "<their apple push notifications token>"
    },
    {
      "name": "Family member N",
      "token": "<their apple push notifications token>"
    }
  ]
}
```

`.p8` and `.pem` files should be downloaded from Apple Developer Portal.

If you are an Apple developer, you can make yourself a simple notification app beforehand and use it to display a token on each device it is installed on, you then paste these tokens into `config.json` files. If you make it in new Swift, send it to us so that we release it earlier instead of finishing and testing our own ;)

#### 🚀 Each device will then start sending you push notifications on various occasions:

- if `dmt-proc` was terminated because of a problem. This is great and important, mostly needed on `dmt renew` when you sync the latest code (including your own additions to [user core](USER_CORE_FRAMEWORK.md)) and the process crashes soon thereafter. It is great to know about this as soon as possible.

- if `dmt-proc` is using a lot of CPU for some reason (potential issue)

- in near future after `v1.2` (focus: IoT) of `dmt-system` you can start getting other notifications like `doorbell rings`, notifications about devices turning on or off (for example: washing machines, heaters etc.), movement sensors, alarms and more.

- soon you will be able to set up device-cross checking so that you get reports if some device gets "missing in action" or your server equipped with `dmt-proc` becomes unreachable.

- you can implement **custom personalized push notifications** through [extending the dmt-core](USER_CORE_FRAMEWORK.md). You can then respond to various events inside the `dmt-proc` (or events coming over the [MQTT](http://mqtt.org) IoT protocol) and decide to send a push notification when appropriate / required. We even provide a simple consensus protocol so that one of few designated devices is always reporting events and when one of them cannot do it anymore for whatever reason, next-in-line takes over. Exactly one device should be reporting local network events, otherwise you get as many push notifications for each subscribed network event as you have devices.
