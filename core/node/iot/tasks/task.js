import parseIfUserAction from './dsl/ifUserAction';
import IfTimeOfDay from './dsl/ifTimeOfDay';
import IfMsg from './dsl/ifMsg';
import TaskOnOffMonitor from './dsl/taskOnOffMonitor';

class Task {
  constructor({ program, taskDef }) {
    this.program = program;
    this.taskDef = taskDef;

    parseIfUserAction({ program, taskDef });
    this.onOffMonitor = new TaskOnOffMonitor(this);
  }

  setup() {
    this.ifTimeOfDay = new IfTimeOfDay(this);
    this.ifMsg = new IfMsg({ task: this, program: this.program });
  }

  tick() {
    if (this.program.isHub()) {
      this.ifTimeOfDay.tick();
    }
  }

  handleMqttEvent({ topic, msg }) {
    if (this.program.isHub()) {
      this.ifMsg.handleMqttEvent({ topic, msg });
      this.onOffMonitor.handleMqttEvent({ topic, msg });
    }
  }
}

export default Task;
