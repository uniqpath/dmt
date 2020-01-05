const OnOffMonitor = require('../../lib/onOffMonitor');

const statementName = 'on-off-monitor';

class TaskOnOffMonitor {
  constructor(task) {
    this.task = task;

    const { program, taskDef } = this.task;

    if (taskDef.type == statementName) {
      const { deviceName, idleSeconds, onlyAdmin } = taskDef;

      this.onOffMonitor = new OnOffMonitor({ program, deviceName, idleSeconds, notifyOnlyAdmin: onlyAdmin });
    }
  }

  handleIotEvent({ topic, msg }) {
    if (this.onOffMonitor) {
      this.onOffMonitor.handleIotEvent({ topic, msg });
    }
  }
}

module.exports = TaskOnOffMonitor;
