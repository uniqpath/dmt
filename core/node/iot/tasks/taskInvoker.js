import Task from './task';
import * as parser from './parser';
class TaskInvoker {
  constructor(program) {
    this.tasks = parser.getTasks().map(taskDef => new Task({ program, taskDef }));
  }

  setup(program) {
    this.tasks.forEach(task => task.setup());
  }

  onProgramTick(program) {
    this.tasks.forEach(task => task.tick());
  }

  handleMqttEvent({ program, topic, msg }) {
    this.tasks.forEach(task => task.handleMqttEvent({ topic, msg }));
  }
}

export default TaskInvoker;
