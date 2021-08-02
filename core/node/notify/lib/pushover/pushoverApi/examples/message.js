#!/usr/bin/env node

'use strict';

let chump = require('../lib/Chump');
let config = require('./config.json');

let client = new chump.Client(config.api_token);
let user = new chump.User(config.user_id, config.user_device);
let message = new chump.Message({
  title: 'Test: title',
  message: 'Test: message',
  user: user,
  url: 'http://example.org',
  urlTitle: 'Example.org',
  priority: new chump.Priority('low')
});

console.log('Sending message...');

client
  .sendMessage(message)
  .then(() => {
    console.log('Message sent!');
  })
  .catch(e => {
    console.log(e);
  });
