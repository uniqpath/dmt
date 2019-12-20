const EventEmitter = require('events');
const sensorMsg = require('../sensorMessageFormats');

class PowerMonitor extends EventEmitter {
  constructor(tasmotaDeviceName, { idleSeconds = 120 } = {}) {
    super();

    this.sensorTopic = tasmotaDeviceName;

    this.currentThreshold = 0.07;
    this.aboveThresholdCounterTrigger = 4;
    this.onTriggerThreshold = 2 * this.currentThreshold;
    this.idleSeconds = idleSeconds;

    this.aboveThresholdCounter = 0;
  }

  handleReading({ topic, msg }) {
    const parsedMsg = sensorMsg.parse({ topic, msg });

    if (parsedMsg && parsedMsg.id == this.sensorTopic && parsedMsg.type == sensorMsg.Type.ENERGY) {
      const { data, lastUpdateAt } = parsedMsg;

      const time = lastUpdateAt;

      const deviceHandle = parsedMsg.id;

      const deviceHandleUpcase = deviceHandle.toUpperCase();

      const current = data.Current;

      if (current > this.onTriggerThreshold) {
        if (this.aboveThresholdCounter >= this.aboveThresholdCounterTrigger) {
          if (!this.deviceOn) {
            this.emit('start', { device: deviceHandle, time });
          }

          this.deviceOn = true;
        }

        this.aboveThresholdCounter += 1;
      } else {
        this.aboveThresholdCounter = 0;
      }

      if (this.deviceOn && current > this.currentThreshold) {
        if (this.lastAboveThreshholdTime) {
          const diff = time - this.lastAboveThreshholdTime;
          if (!this.maxIdle || this.maxIdle < diff) {
            this.maxIdle = diff;
          }
        }

        this.lastAboveThreshholdTime = time;
      }

      if (current < this.currentThreshold) {
        if (this.deviceOn) {
          if (this.lastAboveThreshholdTime) {
            const diff = time - this.lastAboveThreshholdTime;
            if (diff >= this.idleSeconds * 1000) {
              this.emit('finish', { device: deviceHandle, time, longestIdleInterval: this.maxIdle / 1000, idleSeconds: this.idleSeconds });
              this.deviceOn = false;
              this.maxIdle = null;
              this.lastAboveThreshholdTime = null;
            }
          }
        }
      }
    }
  }
}

module.exports = PowerMonitor;
