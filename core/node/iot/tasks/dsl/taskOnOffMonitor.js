import OnOffMonitor from '../../lib/onOffMonitor';

const statementName = 'on-off-monitor';

class TaskOnOffMonitor {
  constructor(task) {
    this.task = task;

    const { program, taskDef } = this.task;

    if (taskDef.type == statementName) {
      this.onOffMonitor = new OnOffMonitor(program, taskDef);
    }
  }

  handleMqttEvent({ topic, msg }) {
    if (this.onOffMonitor) {
      this.onOffMonitor.handleMqttEvent({ topic, msg });
    }
  }
}

export default TaskOnOffMonitor;
