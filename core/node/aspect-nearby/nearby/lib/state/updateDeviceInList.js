export default function updateDeviceInList({ device, program, announce }) {
  const slotName = 'nearbyDevices';

  const selectorPredicate = ({ deviceKey }) => deviceKey == device.deviceKey;

  if (!program.store(slotName).replaceArrayElement(selectorPredicate, device, { announce })) {
    program.store(slotName).pushToArray(device, { announce });
  }
}
