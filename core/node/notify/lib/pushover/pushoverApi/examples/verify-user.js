#!/usr/bin/env node

'use strict';

let chump = require('../lib/Chump');
let config = require('./config.json');

let client = new chump.Client(config.api_token);
let user = new chump.User(config.user_id, config.user_device);

console.log('Verifying user...');

client.verifyUser(user).then(result => {
  console.log('User verified!');
});
