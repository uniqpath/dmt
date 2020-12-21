export default function updateDeviceList({ device, program, announce }) {
  const slotName = 'nearbyDevices';

  const selectorPredicate = ({ deviceKey }) => deviceKey == device.deviceKey;

  if (!program.store.replaceSlotArrayElement(slotName, selectorPredicate, device, { announce })) {
    program.store.pushToSlotArrayElement(slotName, device, { announce });
  }
}
