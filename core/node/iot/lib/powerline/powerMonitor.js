import dmt from 'dmt/common';
import { push } from 'dmt/notify';

import EventEmitter from 'events';
import * as sensorMsg from '../sensorMessageFormats';

class PowerMonitor extends EventEmitter {
  constructor(program, { deviceName, idleSeconds = 120, safetyOffMinutes = null, triggeringCounter = 4 } = {}) {
    super();

    const tasmotaDeviceName = deviceName;

    const safetyOffSeconds = safetyOffMinutes ? safetyOffMinutes * 60 : undefined;

    this.sensorTopic = tasmotaDeviceName;

    this.currentThreshold = 0.07;
    this.aboveThresholdCounterTrigger = triggeringCounter;
    this.onTriggerThreshold = 2 * this.currentThreshold;
    this.idleSeconds = idleSeconds;

    this.aboveThresholdCounter = 0;

    const warningMin = safetyOffSeconds >= 5 * 60 ? Math.round((0.1 * safetyOffSeconds) / 60.0) : undefined;

    dmt.loop(() => {
      if (program && program.isHub() && this.onDetectedAt && safetyOffSeconds) {
        if (warningMin && Date.now() - this.onDetectedAt > 1000 * (safetyOffSeconds - warningMin * 60) && !this.safetyOffWarningSent) {
          const msg = `Warning: ${tasmotaDeviceName} safety OFF in ${warningMin} min.`;
          push.omitDeviceName().notify(msg);
          program.iotMsg('onoff_monitor_safety_off_warning', msg);
          this.safetyOffWarningSent = true;
        }

        if (Date.now() - this.onDetectedAt > safetyOffSeconds * 1000 && !this.safetyOffAlreadyRequested) {
          push.omitDeviceName().notify(`${tasmotaDeviceName} safety OFF triggered, wait for confirmation.`);
          program.iotMsg(`cmnd/${tasmotaDeviceName}/power`, '0');
          program.iotMsg('onoff_monitor_safety_off_triggered', `Safety off triggered for ${tasmotaDeviceName}`);
          this.safetyOffAlreadyRequested = true;
        }
      }
    }, 5000);
  }

  handleReading({ topic, msg }) {
    const parsedMsg = sensorMsg.parse({ topic, msg });

    if (parsedMsg && parsedMsg.id == this.sensorTopic && parsedMsg.type == sensorMsg.Type.ENERGY) {
      const { data, lastUpdateAt } = parsedMsg;

      const time = lastUpdateAt;

      const deviceHandle = parsedMsg.id;

      const current = data.Current;

      if (current > this.onTriggerThreshold) {
        if (this.aboveThresholdCounter >= this.aboveThresholdCounterTrigger) {
          if (!this.deviceOn) {
            this.onDetectedAt = Date.now();
            this.emit('start', { device: deviceHandle, time });

            this.safetyOffAlreadyRequested = false;
            this.safetyOffWarningSent = false;
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
              this.safetyOffAlreadyRequested = false;
              this.safetyOffWarningSent = false;
              this.onDetectedAt = null;
            }
          }
        }
      }
    }
  }
}

export default PowerMonitor;
