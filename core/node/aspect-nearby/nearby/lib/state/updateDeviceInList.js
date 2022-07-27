export default function updateDeviceInList({ device, program, announce }) {
  const selectorPredicate = ({ deviceKey }) => deviceKey == device.deviceKey;

  program.slot('nearbyDevices').setArrayElement(selectorPredicate, device, { announce });
}
