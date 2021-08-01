export default function updateDeviceInList({ device, program, announce }) {
  const selectorPredicate = ({ deviceKey }) => deviceKey == device.deviceKey;

  program.store('nearbyDevices').setArrayElement(selectorPredicate, device, { announce });
}
