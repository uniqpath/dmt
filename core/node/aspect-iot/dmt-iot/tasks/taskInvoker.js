const Task = require('./task');
const parser = require('./parser');
const responsibleNode = require('./responsibleNode');

class TaskInvoker {
  constructor(program) {
    this.tasks = parser.getTasks().map(taskDef => new Task({ program, taskDef }));
  }

  setup(program) {
    responsibleNode.setup(program);
    this.tasks.forEach(task => task.setup());
  }

  manageTick(program) {
    responsibleNode.tick(program);
    this.tasks.forEach(task => task.tick());
  }

  handleIotEvent({ program, topic, msg }) {
    this.tasks.forEach(task => task.handleIotEvent({ topic, msg }));
  }
}

module.exports = TaskInvoker;
