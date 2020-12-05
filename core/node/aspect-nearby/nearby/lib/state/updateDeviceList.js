export default function updateDeviceList({ device, announce, program }) {
  const { nearbyDevices } = program.state();

  let found;

  for (let i = 0; i < nearbyDevices.length; i++) {
    if (nearbyDevices[i].deviceKey == device.deviceKey) {
      nearbyDevices[i] = device;
      found = true;
    }
  }

  if (!found) {
    nearbyDevices.push(device);
  }

  if (announce) {
    program.store.announceStateChange();
  }
}
