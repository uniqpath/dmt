import dmt from 'dmt/common';
const { log } = dmt;

import onoff from 'onoff';
const { Gpio } = onoff;

const LED = new Gpio(16, 'out');

let blinkInterval;

class LEDClass {
  blink() {
    if (!this.nonrpi()) {
      return;
    }

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

  nonrpi() {
    if (!dmt.isRPi()) {
      log.write("Calling stub function on led.js because it's not RaspberryPi");
      return true;
    }
  }

  holdForOneCycle() {
    this.quickBlink = true;
  }

  turnOn() {
    if (!this.nonrpi()) {
      return;
    }

    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }

    LED.writeSync(1);
  }

  turnOff() {
    if (!this.nonrpi()) {
      return;
    }

    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }

    LED.writeSync(0);
  }
}

export default new LEDClass();
