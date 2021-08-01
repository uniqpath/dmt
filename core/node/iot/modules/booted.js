import { log } from 'dmt/common';
import { push } from 'dmt/notify';

function onProgramTick(program) {}

function setup(program) {}

function handleMqttEvent({ program, topic, msg }) {
  if (topic == 'dmt_iot_module_status') {
    try {
      const data = JSON.parse(msg);
      const { moduleStatus, moduleIp, moduleId } = data;

      if (moduleStatus == 'booted') {
        if (program.isHub()) {
          program.nearbyNotification({ title: moduleId, msg: `${moduleStatus} (${moduleIp})`, ttl: 30, color: '#51B6B4', omitDeviceName: true });
          push.omitDeviceName().notify(`${moduleId} @ ${moduleIp} ${moduleStatus}`);
        }
      }
    } catch (e) {
      log.red('Cannot parse message');
      log.yellow(msg);
      log.red(e);
    }
  }
}

export { setup, handleMqttEvent, onProgramTick };
