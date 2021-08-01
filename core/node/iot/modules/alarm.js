import Alarm from '../lib/alarm';

let alarm;

function onProgramTick(program) {}

function setup(program) {
  alarm = new Alarm(program);
}

function handleMqttEvent({ program, topic, msg }) {
  if (topic == 'alarm') {
    if (msg == 'on') {
      msg = 'enable';
    }

    if (msg == 'off') {
      msg = 'disable';
    }

    switch (msg) {
      case 'enable':
        alarm.enable();
        break;

      case 'disable':
        alarm.disable();
        break;

      default:
    }
  }
}

export { setup, handleMqttEvent, onProgramTick };
