import { push } from 'dmt/notify';

import { PowerMonitor, powerLog } from '../powerline';

function notify({ msg, program, notifyOnlyAdmin }) {
  if (program.isResponsibleNode()) {
    if (notifyOnlyAdmin) {
      push.notify(msg);
    } else {
      push.notifyAll(msg);
    }
  }
}

class OnOffMonitor {
  constructor({ program, deviceName, idleSeconds, safetyOffSeconds, notifyOnlyAdmin = false }) {
    this.program = program;
    this.pm = new PowerMonitor(deviceName, { program, idleSeconds, safetyOffSeconds });

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

export default OnOffMonitor;
