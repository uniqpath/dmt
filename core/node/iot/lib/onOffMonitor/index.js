import { log, timeutils } from 'dmt/common';
import { push } from 'dmt/notify';

const { ONE_DAY } = timeutils;

import { PowerMonitor, powerLog } from '../powerline/index.js';

function notify({ title, msg, program, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers }) {
  let users;
  if (pushoverUser || pushoverUsers) {
    users = (pushoverUser || pushoverUsers).split(',').map(u => u.trim());
  }

  if (program.isHub()) {
    const pm = push
      .title(title || program.network.name())
      .optionalApp(pushoverApp)
      .ttl(3 * ONE_DAY)
      .enableHtml()
      .omitDeviceName();

    if (onlyAdmin) {
      pm.notify(msg);
    } else if (users) {
      pm.user(users).notify(msg);
    } else {
      pm.notifyAll(msg);
    }
  }
}

function notificationGroup(iotDeviceTitle, suffix) {
  return `__dmt_iot_on_off_monitor_${iotDeviceTitle}_${suffix}`;
}

class OnOffMonitor {
  constructor(program, taskDef) {
    const { title, deviceName, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers } = taskDef;
    this.deviceName = deviceName;

    this._powerLog = taskDef.powerLog;

    this.program = program;
    this.pm = new PowerMonitor(program, taskDef);

    this.pm.on('start', e => {
      const status = 'is ON …';
      const msg = `${e.device} ${status}`;
      const msgColor = `<font color="#5df699">${msg}</font>`;
      notify({ program, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers, title, msg: msgColor });
      const group = notificationGroup(e.device, 'on');
      program.nearbyNotification({ title: e.device, msg: status, group, ttl: 5 * 60, color: '#5df699', omitDeviceName: true });

      log.green(msg);
    });

    this.pm.on('finish', e => {
      const status = 'DONE✓';
      const msg = `${e.device} ${status}`;
      const msgColor = `<font color="#8592d2">${msg}</font>`;
      notify({ program, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers, msg: msgColor });
      const group = notificationGroup(e.device, 'off');
      program.nearbyNotification({ title: e.device, msg: status, group, ttl: 15 * 60, color: '#8592d2', omitDeviceName: true });

      log.blue(msg);
    });
  }

  handleMqttEvent({ topic, msg }) {
    if (this._powerLog) {
      powerLog(this.deviceName, { topic, msg });
    }

    this.pm.handleReading({ topic, msg });
  }
}

export default OnOffMonitor;
