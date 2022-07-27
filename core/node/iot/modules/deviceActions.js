const ACTIONS = ['sleep', 'reboot', 'shutdown'];
const PLAYER_ACTIONS = ['pause', 'play', 'stop'];

const NEARBY_DEVICE_ACTIONS = ['sleep'];
const NEARBY_PLAYER_ACTIONS = ['pause', 'stop'];
const NEARBY = ['nearby', 'all'];

function handleMqttEvent({ program, topic, msg }) {
  const deviceId = program.device.id;

  if (ACTIONS.includes(topic) && (msg == deviceId || (msg == 'ap' && program.isHub()))) {
    program.api('device').call(topic);
  }

  if (PLAYER_ACTIONS.includes(topic) && msg == deviceId) {
    program.api('player').call(topic);
  }

  if (NEARBY.includes(msg)) {
    if (NEARBY_PLAYER_ACTIONS.includes(topic)) {
      program.api('player').call(topic);
    }

    if (NEARBY_DEVICE_ACTIONS.includes(topic)) {
      program.api('device').call(topic);
    }
  }
}

export { handleMqttEvent };
