const { push } = require('dmt-notify');

const powerline = require('../powerline');
const { PowerMonitor, powerLog } = powerline;

function notify({ msg, program, notifyOnlyAdmin }) {
  if (program.responsibleNode) {
    if (notifyOnlyAdmin) {
      push.notify(msg);
    } else {
      push.notifyAll(msg);
    }
  }
}

class OnOffMonitor {
  constructor({ program, deviceName, idleSeconds, notifyOnlyAdmin = false }) {
    this.program = program;
    this.pm = new PowerMonitor(deviceName, { idleSeconds });

    this.pm.on('start', e => {
      const msg = `${e.device} is ON …`;
      notify({ program, notifyOnlyAdmin, msg });
      program.showNotification({ msg, ttl: 5 * 60, dontDisplaySinceTimer: true, bgColor: '#77DA9C' });
    });

    this.pm.on('finish', e => {
      const msg = `${e.device} DONE✓`;
      notify({ program, notifyOnlyAdmin, msg });
      program.showNotification({ msg, ttl: 15 * 60, bgColor: '#6163D1', color: 'white' });
    });
  }

  handleIotEvent({ topic, msg }) {
    this.pm.handleReading({ topic, msg });
  }
}
module.exports = OnOffMonitor;