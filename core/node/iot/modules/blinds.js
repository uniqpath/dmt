import dmt from 'dmt/common';
import { push } from 'dmt/notify';

function manageTick(program) {}

function setup(program) {}

function handleBooted({ placeId, blindsId, blindsDirection, moduleIp }) {
  const tag = `${placeId}-${blindsId}-${blindsDirection} (${moduleIp})`;
  push.omitDeviceName().notify(`Module ${tag} BOOTED`);
}

function handleMoving(program, { placeId, blindsId, blindsDirection, blindsStatus }) {
  const id = `${placeId}-${blindsId}-${blindsDirection}`;
  program.store.replaceSlotElement({ slotName: 'blinds', key: id, value: { blindsStatus, receivedAt: Date.now() } }, { announce: true });
}

function handleStopped(program, { placeId, blindsId, blindsDirection, blindsStatus }) {
  const id = `${placeId}-${blindsId}-${blindsDirection}`;
  program.store.removeSlotElement({ slotName: 'blinds', key: id }, { announce: true });
}

function handleIotEvent({ program, topic, msg }) {
  if (topic == 'blinds') {
    const data = JSON.parse(msg);

    const { blindsStatus } = data;

    switch (blindsStatus) {
      case 'booted':
        if (program.isHub()) {
          handleBooted(data);
        }
        break;
      case 'moving':
        handleMoving(program, data);
        break;
      case 'stopped':
        handleStopped(program, data);
        break;
      default:
        break;
    }
  }
}

export { setup, handleIotEvent, manageTick };
