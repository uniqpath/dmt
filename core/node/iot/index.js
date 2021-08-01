import path from 'path';

import { push } from 'dmt/notify';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const modulesPath = path.join(__dirname, 'modules');

import * as powerline from './lib/powerline';

import IotBus from './lib/iotBus';

import removeStaleNearbySensorsData from './removeStaleNearbySensorsData';

import specialNodes from './lib/iotBus/specialNodes';

import Alarm from './lib/alarm';

const iotBus = new IotBus();

import loadIotModules from './loadIotModules';

let program;

function init(_program) {
  program = _program;
  iotBus.init();

  iotBus.on('message', msg => {
    program.emit('iot:message', msg);
  });

  loadIotModules({ program, modulesPath });

  program.on('iot:message', ({ topic, msg }) => {
    if (topic == 'onoff_monitor_safety_off_warning') {
      program.showNotification({ msg, ttl: 5 * 60, color: 'white', bgColor: '#9D008E' });
    }

    if (topic == 'onoff_monitor_safety_off_triggered') {
      program.showNotification({ msg, ttl: 15 * 60, color: 'white', bgColor: '#D41E25' });
    }
  });

  removeStaleNearbySensorsData(program);
  program.on('tick', () => removeStaleNearbySensorsData(program));

  program.on('dmt_gui_action', ({ action, namespace, payload }) => {
    if (namespace == 'iot') {
      if (typeof payload != 'string') {
        payload = JSON.stringify(payload);
      }

      iotBus.publish({ topic: action, msg: payload });
    }
  });

  return { bus: iotBus };
}

export { init, loadIotModules, iotBus, specialNodes, Alarm, powerline };
