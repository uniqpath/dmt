import { push } from 'dmt/notify';

function onProgramTick(program) {}

function setup(program) {}

function handleBooted({ restarterId, moduleIp }) {
  const tag = `${restarterId}`;
  push.omitDeviceName().notify(`Module ${tag} (${moduleIp}) BOOTED`);
}

const slotName = 'deviceRestarters';

function handleRestarting(program, { restarterId, status }) {
  const patch = {};
  patch[restarterId] = { status, receivedAt: Date.now() };
  program.store(slotName).update(patch, { announce: true });
}

function handleRestartFinished(program, { restarterId }) {
  program.store(slotName).removeKey(restarterId, { announce: true });
}

function handleMqttEvent({ program, topic, msg }) {
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

export { setup, handleMqttEvent, onProgramTick };
