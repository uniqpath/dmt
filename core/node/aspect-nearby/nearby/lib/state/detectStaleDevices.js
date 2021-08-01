export default function detectStaleDevices({ nearbyDevices, broadcastInterval }, { removeStaleImmediately = false } = {}) {
  const list = [];

  const now = Date.now();

  for (const device of nearbyDevices.filter(({ thisDevice }) => !thisDevice)) {
    if (now - device.lastSeenAt > 2.2 * broadcastInterval) {
      if (!device.stale && !removeStaleImmediately) {
        list.push({ ...device, ...{ stale: true, staleDetectedAt: now } });
      } else if (device.staleDetectedAt && now - device.staleDetectedAt < 3000) {
        list.push({ ...device });
      }
    } else {
      list.push({ ...device, ...{ stale: false, staleDetectedAt: undefined } });
    }
  }

  return list;
}
