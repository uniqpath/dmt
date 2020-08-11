import attachNearbyDeviceAttributes from './attachNearbyDeviceAttributes';

export default function construct({ program, deviceName, message }) {
  const ip = program.state.controller ? program.state.controller.ip : null;
  const msg = { deviceName, ip, processId: process.pid, message, origin: 'dmt' };
  return attachNearbyDeviceAttributes({ program, msg });
}
