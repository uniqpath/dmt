# rpi-throttled [![NPM Version](https://img.shields.io/npm/v/rpi-throttled.svg)](https://www.npmjs.com/package/rpi-throttled)

Library to check for undervoltage and overheating events on a Raspberry Pi

## Introduction
This library uses the `vcgencmd get_throttled` command to check for past or current under-voltage or over-heating events as well as the current state of throttling of the Raspberry Pi

## Usage
### Command Line
The npm package will install a command line tool to display the status, enter `rpi-throttled` to get a readout.

### Library
Use the library as shown below.

```
var RpiThrottled = require('rpi-throttled');

//create a new object
var rpi = new RpiThrottled();
//read current values from rPi, wait until ready
rpi.update(false);

//available values
console.log("Throttled:" + rpi.throttled);
console.log("Under Voltage:" + rpi.underVoltage);
console.log("Soft Temp Limit:" + rpi.softTempLimit);
console.log("Frequency Capped:" + rpi.frequencyCapped);
console.log("Throttling Occurred:" + rpi.throttledOccurred);
console.log("Under Voltage Occurred:" + rpi.underVoltageOccurred);
console.log("Soft Temp Limit Occurred:" + rpi.softTempLimitOccurred);
console.log("Frequency Capped Occurred:" + rpi.frequencyCappedOccurred);

//read current values from rPi asynchronously and listen to updated callback
rpi.update();
rpi.on("updated", function(){console.log("Throttled:" + rpi.throttled)});

//print values to console
rpi.printData();
```
