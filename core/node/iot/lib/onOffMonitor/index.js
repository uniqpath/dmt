import { push } from 'dmt/notify';

import { PowerMonitor, powerLog } from '../powerline';

function notify({ msg, program, onlyAdmin }) {
  if (program.isHub()) {
    if (onlyAdmin) {
      push.notify(msg);
    } else {
      push.notifyAll(msg);
    }
  }
}

class OnOffMonitor {
  constructor(program, taskDef) {
    const { onlyAdmin } = taskDef;

    this.program = program;
    this.pm = new PowerMonitor(program, taskDef);

    this.pm.on('start', e => {
      const msg = `${e.device} is ON …`;
      notify({ program, onlyAdmin, msg });
      program.showNotification({ msg, ttl: 5 * 60, dontDisplaySinceTimer: true, bgColor: '#77DA9C' });
    });

    this.pm.on('finish', e => {
      const msg = `${e.device} DONE✓`;
      notify({ program, onlyAdmin, msg });
      program.showNotification({ msg, ttl: 15 * 60, bgColor: '#6163D1', color: 'white' });
    });
  }

  handleIotEvent({ topic, msg }) {
    this.pm.handleReading({ topic, msg });
  }
}

export default OnOffMonitor;
