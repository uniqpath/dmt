const attachNearbyDeviceAttributes = require('./attachNearbyDeviceAttributes');

function construct({ program = null, deviceId, ip, message }) {
  const msg = { deviceId, ip, processId: process.pid, message, origin: 'dmt' };
  return attachNearbyDeviceAttributes({ program, msg });
}

module.exports = construct;
