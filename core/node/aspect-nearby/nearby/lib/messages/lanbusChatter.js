import attachNearbyDeviceAttributes from './attachNearbyDeviceAttributes';

export default function construct({ program, deviceId, message }) {
  const ip = program.state.controller ? program.state.controller.ip : null;
  const msg = { deviceId, ip, processId: process.pid, message, origin: 'dmt' };
  return attachNearbyDeviceAttributes({ program, msg });
}
