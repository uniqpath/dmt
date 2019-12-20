const parseIfUserAction = require('./dsl/ifUserAction');
const IfTimeOfDay = require('./dsl/ifTimeOfDay');
const IfMsg = require('./dsl/ifMsg');
const TaskOnOffMonitor = require('./dsl/taskOnOffMonitor');

class Task {
  constructor({ program, taskDef }) {
    this.program = program;
    this.taskDef = taskDef;

    parseIfUserAction({ program, taskDef });
    this.onOffMonitor = new TaskOnOffMonitor(this);
  }

  setup() {
    if (this.program.specialNode) {
      this.ifTimeOfDay = new IfTimeOfDay(this);
      this.ifMsg = new IfMsg({ task: this, program: this.program });
    }
  }

  tick() {
    if (this.program.responsibleNode) {
      this.ifTimeOfDay.tick();
    }
  }

  handleIotEvent({ topic, msg }) {
    if (this.program.responsibleNode) {
      this.ifMsg.handleIotEvent({ topic, msg });
    }

    this.onOffMonitor.handleIotEvent({ topic, msg });
  }
}

module.exports = Task;
