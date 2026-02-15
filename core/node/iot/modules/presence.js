import { log } from 'dmt/common';
import { push } from 'dmt/notify';

function onProgramTick(program) {}

function setup(program) {}

function handleMqttEvent({ program, topic, msg }) {
  if (topic == 'dmt_iot_module_status') {
    try {
      const data = JSON.parse(msg);
      const { moduleStatus, moduleIp, moduleId } = data;

      if (moduleStatus == 'presence') {
      }
    } catch (e) {
      log.red('Cannot parse message');
      log.yellow(msg);
      log.red(e);
    }
  }
}

export { setup, handleMqttEvent, onProgramTick };
