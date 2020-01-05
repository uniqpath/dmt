import TaskInvoker from '../tasks/taskInvoker.js';

let taskInvoker;

function setup(program) {
  taskInvoker = new TaskInvoker(program);

  taskInvoker.setup(program);
}

function manageTick(program) {
  taskInvoker.manageTick(program);
}

function handleIotEvent({ program, topic, msg }) {
  taskInvoker.handleIotEvent({ program, topic, msg });
}

export { setup, handleIotEvent, manageTick };
