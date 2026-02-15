export default function detectStaleDevices({ nearbyDevices, broadcastInterval }) {
  const list = [];

  const now = Date.now();

  for (const device of nearbyDevices.filter(({ thisDevice }) => !thisDevice)) {
    if (now - device.lastSeenAt >= 1.95 * broadcastInterval) {
      if (!device.stale) {
        list.push({ ...device, ...{ stale: true, staleDetectedAt: now } });
      } else if (device.staleDetectedAt && now - device.staleDetectedAt <= broadcastInterval / 2) {
        list.push({ ...device });
      }
    } else {
      list.push({ ...device, ...{ stale: false, staleDetectedAt: undefined } });
    }
  }

  return list;
}
