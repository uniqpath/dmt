import dmt from 'dmt/common';

function manageTick(program) {}

function setup(program) {}

function handleIotEvent({ program, topic, msg }) {
  if (topic == 'doorbell') {
    switch (msg) {
      case 'ring':
        program.showNotification({ id: 'doorbell', msg: 'DOORBELL RING', ttl: 60, bgColor: '#72C2F0' });
        break;

      case 'test':
        if (dmt.isDevUser()) {
          program.showNotification({ id: 'doorbell', msg: 'DOORBELL RING TEST', ttl: 10, bgColor: '#5EA0C7' });
        }
        break;

      case 'enabled':
        program.showNotification({ id: 'doorbell', msg: 'Doorbell Enabled', ttl: 10, bgColor: '#3BA435' });
        break;

      case 'disabled':
        program.showNotification({ id: 'doorbell', msg: 'Doorbell Disabled', ttl: 10, bgColor: '#EE7049' });
        break;

      default:
    }
  }
}

export { setup, handleIotEvent, manageTick };
