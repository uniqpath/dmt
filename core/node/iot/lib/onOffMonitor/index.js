import { log } from 'dmt/common';
import { push } from 'dmt/notify';

import { PowerMonitor, powerLog } from '../powerline/index.js';

function notify({ msg, program, onlyAdmin }) {
  if (program.isHub()) {
    if (onlyAdmin) {
      push.omitDeviceName().notify(msg);
    } else {
      push.omitDeviceName().notifyAll(msg);
    }
  }
}

function notificationGroup(iotDeviceTitle, suffix) {
  return `__dmt_iot_on_off_monitor_${iotDeviceTitle}_${suffix}`;
}

class OnOffMonitor {
  constructor(program, taskDef) {
    const { onlyAdmin } = taskDef;

    this.program = program;
    this.pm = new PowerMonitor(program, taskDef);

    this.pm.on('start', e => {
      const status = 'Is ON …';
      const msg = `${e.device} ${status}`;
      notify({ program, onlyAdmin, msg });
      const group = notificationGroup(e.device, 'on');
      program.nearbyNotification({ title: e.device, msg: status, group, ttl: 5 * 60, color: '#77DA9C', omitDeviceName: true });

      log.green(msg);
    });

    this.pm.on('finish', e => {
      const status = 'DONE✓';
      const msg = `${e.device} ${status}`;
      notify({ program, onlyAdmin, msg });
      const group = notificationGroup(e.device, 'off');
      program.nearbyNotification({ title: e.device, msg: status, group, ttl: 15 * 60, color: '#6163D1', omitDeviceName: true });

      log.blue(msg);
    });
  }

  handleMqttEvent({ topic, msg }) {
    this.pm.handleReading({ topic, msg });
  }
}

export default OnOffMonitor;
