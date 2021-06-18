import dmt from 'dmt/common';
import { push } from 'dmt/notify';

function manageTick(program) {}

function setup(program) {}

function handleBooted({ restarterId, moduleIp }) {
  const tag = `${restarterId}`;
  push.notify(`Module ${tag} (${moduleIp}) BOOTED`);
}

const slotName = 'deviceRestarters';

function handleRestarting(program, { restarterId, status }) {
  program.store.replaceSlotElement({ slotName, key: restarterId, value: { status, receivedAt: Date.now() } }, { announce: true });
}

function handleRestartFinished(program, { restarterId }) {
  program.store.removeSlotElement({ slotName, key: restarterId }, { announce: true });
}

function handleIotEvent({ program, topic, msg }) {
  if (topic == 'device_restart') {
    const data = JSON.parse(msg);

    const { status } = data;

    switch (status) {
      case 'booted':
        if (program.isHub()) {
          handleBooted(data);
        }
        break;
      case 'restarting':
        handleRestarting(program, data);
        break;
      case 'restart_finished':
        handleRestartFinished(program, data);
        break;
      default:
        break;
    }
  }
}

export { setup, handleIotEvent, manageTick };
