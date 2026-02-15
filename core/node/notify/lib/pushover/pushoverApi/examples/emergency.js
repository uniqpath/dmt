#!/usr/bin/env node

'use strict';

let chump = require('../lib/Chump');
let config = require('./config.json');

let client = new chump.Client(config.api_token);
let user = new chump.User(config.user_id, config.user_device);
let message = new chump.Message({
  title: 'The roof is on fire!',
  message: '<b>Put it out immediately!</b>',
  enableHtml: true,
  user: user,
  priority: new chump.Priority('emergency'),
  sound: new chump.Sound('siren')
});

console.log('Sending emergency message...');

client
  .sendMessage(message)
  .then(receipt => {
    console.log(`Retrieving receipt ${receipt}`);

    return client.getReceipt(receipt);
  })
  .then(receipt => {
    console.log(`Receipt: ${receipt.id}`);
    console.log(`Acknowledged: ${receipt.isAcknowledged}`);
    console.log(`Acknowledged by: ${receipt.acknowledgedBy}`);
    console.log(`Last delivered at: ${receipt.lastDeliveredAt}`);
    console.log(`Is expired: ${receipt.isExpired}`);
    console.log(`Expires at: ${receipt.expiresAt}`);
    console.log(`Has called back: ${receipt.hasCalledBack}`);
    console.log(`Called back at: ${receipt.calledBackAt}`);

    return receipt;
  })
  .then(receipt => {
    console.log(`Cancelling emergency using receipt ${receipt.id}`);

    return client.cancelEmergency(receipt.id);
  })
  .then(() => {
    console.log(`Displaying app info:`);

    console.log(`App limit: ${client.appLimit}`);
    console.log(`App remaining: ${client.appRemaining}`);
    console.log(`App reset: ${client.appReset}`);
  })
  .catch(error => {
    console.log(error.stack);
  });
