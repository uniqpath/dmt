import IfTimeOfDay from './dsl/ifTimeOfDay.js';
import TaskOnOffMonitor from './dsl/taskOnOffMonitor.js';

class Task {
  constructor({ program, taskDef }) {
    this.program = program;
    this.taskDef = taskDef;

    this.onOffMonitor = new TaskOnOffMonitor(this);
  }

  setup() {
    this.ifTimeOfDay = new IfTimeOfDay(this);
  }

  tick() {
    if (this.program.isHub()) {
      this.ifTimeOfDay.tick();
    }
  }

  handleMqttEvent({ topic, msg }) {
    if (this.program.isHub()) {
      this.onOffMonitor.handleMqttEvent({ topic, msg });
    }
  }
}

export default Task;
