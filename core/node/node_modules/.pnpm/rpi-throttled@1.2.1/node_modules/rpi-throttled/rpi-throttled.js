#!/usr/bin/env node
var RpiThrottled = require('./lib.js');
var rpi = new RpiThrottled();
rpi.on('updated',function(){
  rpi.printData();
});
