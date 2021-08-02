#!/usr/bin/env node

'use strict';

let chump = require('../lib/Chump');
let config = require('./config.json');

let client = new chump.Client(config.api_token);
let user = new chump.User(config.user_id, config.user_device);
let group = new chump.Group(config.group_id);

console.log('Getting group details...');

client
  .getGroupDetails(group)
  .then(group => {
    console.log(`Group name: ${group.name}`);

    for (let i of group.users) {
      console.log(`User: ${i.id}, ${i.device}`);
    }

    return group;
  })
  .then(() => {
    console.log('Adding user to group...');

    return client.addUserToGroup(user, group);
  })
  .then(() => {
    console.log('Disabling user in group...');

    return client.disableGroupUser(user, group);
  })
  .then(() => {
    console.log('Enabling user in group...');

    return client.enableGroupUser(user, group);
  })
  .then(() => {
    console.log('Removing user from group...');

    return client.removeUserFromGroup(user, group);
  })
  .then(() => {
    console.log('Renaming group...');

    return client.renameGroup(group, `New group name ${Math.floor(Date.now() / 1000)}`);
  })
  .catch(error => {
    console.log(error.stack);
  });
