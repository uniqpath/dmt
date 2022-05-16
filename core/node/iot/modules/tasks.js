import TaskInvoker from '../tasks/taskInvoker.js';

let taskInvoker;

function setup(program) {
  taskInvoker = new TaskInvoker(program);

  taskInvoker.setup(program);
}

function onProgramTick(program) {
  taskInvoker.onProgramTick(program);
}

function handleMqttEvent({ program, topic, msg }) {
  taskInvoker.handleMqttEvent({ program, topic, msg });
}

export { setup, handleMqttEvent, onProgramTick };
