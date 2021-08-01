"use strict";
const { exec } = require('child_process');
const spawn = require('child_process').spawn;
const EventEmitter = require('events').EventEmitter;
const util = require('util');

function RpiThrottled(){
  this.underVoltage = false;
  this.frequencyCapped = false;
  this.throttled = false;
  this.softTempLimit = false;
  this.underVoltageOccurred = false;
  this.frequencyCappedOccurred = false;
  this.throttledOccurred = false;
  this.softTempLimitOccurred = false;
  this.update();
};

RpiThrottled.prototype = {
  update: function(async = true){
    if(async){
      let command = spawn('vcgencmd', ['get_throttled']);
      command.stdout.on('data',this.setData.bind(this));
    }
    else{
      let that = this;
      exec('vcgencmd get_throttled', (err, stdout, stderr) => {
        if (err) {
          console.log("Error executing vcgencmd:" + err);
          return;
        }
        that.setData(stdout);
      });
    }
  },
  setData: function(data){
    var number = parseInt(String(data).replace("throttled=",""), 16);
    this.underVoltage = (number >> 0) & 1?true:false;
    this.frequencyCapped = (number >> 1) & 1?true:false;
    this.throttled = (number >> 2) & 1?true:false;
    this.softTempLimit = (number >> 3) & 1?true:false;
    this.underVoltageOccurred = (number >> 16) & 1?true:false;
    this.frequencyCappedOccurred = (number >> 17) & 1?true:false;
    this.throttledOccurred = (number >> 18) & 1?true:false;
    this.softTempLimitOccurred = (number >> 19) & 1?true:false;
    this.emit('updated');
  },
  printData: function(){
    console.log("Throttled................: " + this.throttled);
    console.log("Under Voltage............: " + this.underVoltage);
    console.log("Soft Temp Limit..........: " + this.softTempLimit);
    console.log("Frequency Capped.........: " + this.frequencyCapped);
    console.log("Throttling Occurred......: " + this.throttledOccurred);
    console.log("Under Voltage Occurred...: " + this.underVoltageOccurred);
    console.log("Soft Temp Limit Occurred.: " + this.softTempLimitOccurred);
    console.log("Frequency Capped Occurred: " + this.frequencyCappedOccurred);
  }
}

util.inherits(RpiThrottled, EventEmitter);
module.exports = RpiThrottled;
