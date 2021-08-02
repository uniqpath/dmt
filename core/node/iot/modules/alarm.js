import dmt from 'dmt/common';
import { push } from 'dmt/notify';

import Alarm from '../lib/alarm';

let alarm;

function manageTick(program) {}

function setup(program) {
  alarm = new Alarm(program);
}

function handleIotEvent({ program, topic, msg }) {
  if (topic == 'alarm') {
    if (msg == 'on') {
      msg = 'enable';
    }

    if (msg == 'off') {
      msg = 'disable';
    }

    switch (msg) {
      case 'enable':
        alarm.enable();
        break;

      case 'disable':
        alarm.disable();
        break;

      case 'enabled':
        program.showNotification({ id: 'alarm', msg: 'Alarm enabled', ttl: 60, bgColor: '#9A4EF1' });
        if (alarm.thisDeviceManagesAlarm()) {
          push.omitDeviceName().notifyAll('Alarm enabled');
        }
        break;

      case 'disabled':
        program.showNotification({ id: 'alarm', msg: 'Alarm disabled', ttl: 60, bgColor: '#5FF5B5' });
        if (alarm.thisDeviceManagesAlarm()) {
          push.omitDeviceName().notifyAll('Alarm disabled');
        }
        break;

      default:
    }
  }
}

export { setup, handleIotEvent, manageTick };
