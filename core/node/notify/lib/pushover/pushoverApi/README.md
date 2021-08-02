<p align="center">
  <img src="https://cdn.rawgit.com/sqmk/chump/5c292306a220791bcd17d70eeb3f9b4d04e2bb51/media/logo.svg" alt="Chump" />
</p>

# Chump - Pushover.net client for Node.js

[![NPM Version](https://img.shields.io/npm/v/chump.svg?style=flat-square)](https://www.npmjs.com/package/chump)
[![Build Status](https://img.shields.io/travis/sqmk/chump/master.svg?style=flat-square)](https://travis-ci.org/sqmk/chump)
[![Dependency Status](https://img.shields.io/david/sqmk/chump.svg?style=flat-square)](https://david-dm.org/sqmk/chump)

Chump is a client for the popular [Pushover.net](https://pushover.net) real-time
notification service.

Use Chump to send Android, iOS, watchOS, and desktop notifications.

Chump makes **full use** of Pushover.net's API.

## Installation

Chump was written for **Node.js 4+**.

`npm install --save chump`

## Basic Usage

It is easy to send messages via Pushover.net using Chump.

### Sending Messages

```js
let chump = require('chump');

// Instantiate client with your api token
let client = new chump.Client('yourApiToken');

// Instantiate a destination user
let user = new chump.User('userIdHere', 'optionalUserDeviceHere');

// Instantiate a message
let message = new chump.Message({
  title:      'Example title',
  message:    'Example message',
  enableHtml: false,
  user:       user,
  url:        'http://example.org',
  urlTitle:   'Example.org',
  priority:   new chump.Priority('low'),
  sound:      new chump.Sound('magic')
});

// Send the message, handle result within a Promise
client.sendMessage(message)
  .then(() => {
	  console.log('Message sent.');
  })
  .catch(error => {
  	console.log('An error occurred.');
    console.log(error.stack);
  });
```

All client methods that send a command return a **Promise**.

### Sending Messages With Emergency Priority

An emergency priority can be attached to a message. This requires that the
message is acknowledged by the user, and can renotify the user on failure to
acknowledge. Pushover.net can also call an optional callback URL after the user
acknowledges the message. A message receipt is returned to the resolved Promise
on successful delivery of emergency priority messages.

```js
let priority = new chump.Priority('emergency', {
  retry:    300,  // Optional: Notify user every 5 minutes (300 seconds) until acknowledged
  expire:   3600, // Optional: Expire the message in 1 hour (3600 seconds)
  callback: 'http://example.org' // Optional: Callback URL
});

let message = new chump.Message({
  title:    'Example emergency',
  message:  'Super important message',
  user:     user,
  priority: priority
});

client.sendMessage(message)
  .then(receipt => {
    console.log(`Message sent. Receipt is ${receipt}`);
  });
```

## Advanced Usage

Chump supports the entire Pushover.net API. The client offers convenience methods
that correspond to each Pushover.net endpoint.

As documented earlier, all client methods that send a command return a **Promise**.

### .verifyUser

Verify that a user (and optionally, the user's device) exists on Pushover.net

```js
let user = new chump.user('userIdHere', 'optionalUserDeviceHere');

// Verify the user exists
client.verifyUser(user)
  .then(() => {
    console.log('User exists.');
  })
  .catch(error => {
    console.log('User may not exist.');
    console.log(error.stack);
  });
```

### .getReceipt

Additional receipt information can be retrieved from Pushover.net. Receipts are
only returned for messages sent with an emergency priority.

```js
client.getReceipt(receipt)
  .then(receipt => {
    console.log(`Receipt: ${receipt.id}`);
    console.log(`Acknowledged: ${receipt.isAcknowledged}`);
    console.log(`Acknowledged by: ${receipt.acknowledgedBy}`);
    console.log(`Last delivered at: ${receipt.lastDeliveredAt}`);
    console.log(`Is expired: ${receipt.isExpired}`);
    console.log(`Expires at: ${receipt.expiresAt}`);
    console.log(`Has called back: ${receipt.hasCalledBack}`);
    console.log(`Called back at: ${receipt.calledBackAt}`);
  });
```

### .cancelEmergency

A message with an emergency priority can be cancelled.

```js
client.cancelEmergency(receipt);
```

### .getGroupDetails

Pushover.net supports managing users within groups. Creating groups can only be
done through Pushover.net's website. Assuming you know the group Id, you can use
Chump to retrieve information for the group from Pushover.net.

```js
let group = new chump.Group(groupId);

client.getGroupDetails(group)
  .then(group => {
    console.log(`Group name: ${group.name}`);

    for (let user of group.users) {
      console.log(`User: ${user.id}, ${user.device}`);
    }
  });
```

### .addUserToGroup

Add a user to a known group.

```js
let user  = new chump.User(userId);
let group = new chump.Group(groupId);

client.addUserToGroup(user, group);
```

### .removeUserFromGroup

Remove a user from a known group.

```js
let user  = new chump.User(userId);
let group = new chump.Group(groupId);

client.removeUserFromGroup(user, group);
```

### .enableGroupUser

Enable a user in a known group.

```js
let user  = new chump.User(userId);
let group = new chump.Group(groupId);

client.enableGroupUser(user, group);
```

### .disableGroupUser

Disable a user in a known group.

```js
let user  = new chump.User(userId);
let group = new chump.Group(groupId);

client.disableGroupUser(user, group);
```

### .renameGroup

Rename a known group.

```js
let group = new chump.Group(groupId);

client.renameGroup(group, 'New name');
```

## Track Application Limitations

Pushover.net limits the number of messages emitted from its service. Chump keeps
track of these limitations after each successful message sent. You can access app
limitations from the following client properties:

```js
// Maximum number of messages that can be sent
let appLimit = client.appLimit;

// Number of messages remaining in time period
let appRemaining = client.appRemaining;

// Date when app remaining resets to app limit
let appReset = client.appReset;
```

## Examples

Want to see more examples? View them in the [examples](examples) directory included
in this repository.

## Logo

Chump's initial logo was designed by scorpion6 on Fiverr. Font used is Lato Bold.

## License

This software is licensed under the MIT License. [View the license](LICENSE).

Copyright © 2015 [Michael K. Squires](http://sqmk.com)
