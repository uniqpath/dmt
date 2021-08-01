import { log, colors, isRPi, isMacOS } from 'dmt/common';

import { push } from 'dmt/notify';

import { bashReboot, bashShutdown, sleepMacOS, bashSetAccessPoint } from 'dmt/device-control';

function ensureRPi(action, program) {
  if (isRPi()) {
    return true;
  }

  log.red(`Device is not ${colors.yellow('RaspberryPi,')} ignoring ${action} request`);

  if (action == 'reboot') {
    const msg = '✖ Ignoring reboot action (not RPi)…';
    program?.nearbyNotification({ msg, color: '#D04F34', ttl: 10 });
    push.notify(msg);
  }
}

function ensureMacOS(action) {
  if (isMacOS()) {
    return true;
  }

  log.red(`Operating system is not ${colors.yellow('MacOS')}, ignoring action ${action}`);
}

function getMethods() {
  const methods = [];

  methods.push({ name: 'sleep', handler: sleep });
  methods.push({ name: 'reboot', handler: reboot });
  methods.push({ name: 'shutdown', handler: shutdown });
  methods.push({ name: 'enableAP', handler: enableAP });
  methods.push({ name: 'disableAP', handler: disableAP });

  return methods;
}

function sleep({ args, program }) {
  return new Promise((success, reject) => {
    if (ensureMacOS('sleep')) {
      const msg = 'Device sleep';

      program.nearbyNotification({ msg, ttl: 30, color: '#1D61C0', group: `device-sleep/${program.device.id}` });
      log.magenta(msg);

      push.notify(`💤 ${msg}`).then(() => {
        sleepMacOS({ program }).catch(err => push.highPriority().notifyAll(`❗⚠️ ${err} 💡 Solution: first login with main user and then it will work!`));
      });
    }
  });
}

function reboot({ args, program }) {
  return new Promise((success, reject) => {
    if (ensureRPi('reboot', program)) {
      log.magenta('Rebooting now...');

      const msg = 'Rebooting …';

      program.nearbyNotification({ msg, color: '#26ADC4', ttl: 15 });

      push.notify(msg).then(() => {
        bashReboot({ program });
      });
    }
  });
}

function shutdown({ args, program }) {
  return new Promise((success, reject) => {
    if (ensureRPi('shutdown')) {
      log.magenta('Shutting down now...');
      bashShutdown({ program });
    }
  });
}

function enableAP({ args, program }) {
  return new Promise((success, reject) => {
    if (ensureRPi('enableAP')) {
      log.magenta('Enabling Access Point mode ...');
      bashSetAccessPoint({ program, action: 'enable' });
    }
  });
}

function disableAP({ args, program }) {
  return new Promise((success, reject) => {
    if (ensureRPi('disableAP')) {
      log.magenta('Disabling Access Point mode ...');
      bashSetAccessPoint({ program, action: 'disable' });
    }
  });
}

const methods = getMethods();

export default methods;
