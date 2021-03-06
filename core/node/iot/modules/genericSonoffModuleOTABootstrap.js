import dmt from 'dmt/common';
import { push } from 'dmt/notify';

const { log } = dmt;

function manageTick(program) {}

function setup(program) {}

function handleBooted({ moduleIp }) {
  push.notify(`Generica Sonoff OTA-ready module at ${moduleIp} BOOTED`);
}

function handleIotEvent({ program, topic, msg }) {
  if (topic == 'sonoff_module_generic_ota_ready') {
    const data = JSON.parse(msg);

    const { moduleStatus, moduleIp } = data;

    switch (moduleStatus) {
      case 'booted':
        if (program.isHub()) {
          handleBooted({ moduleIp });
        }
        break;
      default:
        log.red(`Unknown mqtt message: ${topic} / ${msg}`);
        break;
    }
  }
}

export { setup, handleIotEvent, manageTick };
