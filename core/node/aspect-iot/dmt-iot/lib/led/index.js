const dmt = require('dmt-bridge');
const { log } = dmt;

if (!dmt.isRPi()) {
  const blankFn = function() {
    log.write("Calling stub function on led.js because it's not RaspberryPi");
  };
  module.exports = { blink: blankFn, turnOn: blankFn };
  return;
}

var Gpio = require('onoff').Gpio;
var LED = new Gpio(16, 'out');

let blinkInterval;

class LEDClass {
  blink() {
    blinkInterval = setInterval(blink, 150);

    let count = 0;
    let quickBlinkWhen = null;
    let outside = this;

    function blink() {
      if (outside.quickBlink && count % 8 == 0) {
        quickBlinkWhen = count;
        outside.quickBlink = false;
      }
      if ((quickBlinkWhen && count - quickBlinkWhen < 8) || count % 8 == 0) {
        LED.writeSync(1);
      } else {
        LED.writeSync(0);
      }

      if (count - quickBlinkWhen >= 8) {
        quickBlinkWhen = null;
      }

      count += 1;
    }
  }

  holdForOneCycle() {
    this.quickBlink = true;
  }

  turnOn() {
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }

    LED.writeSync(1);
  }

  turnOff() {
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }

    LED.writeSync(0);
  }
}

module.exports = new LEDClass();
