function getMatchingConnection({ store, deviceDir, connectionId }) {
  const { state } = store;

  if (state.devices) {
    const matchingDevice = state.devices.find(device => device.deviceDir == deviceDir);
    if (matchingDevice) {
      matchingDevice.connect = matchingDevice.connect || [];

      const matchingConnection = matchingDevice.connect.find(entry => entry.toLowerCase() == connectionId.toLowerCase());
      return { matchingDevice, matchingConnection };
    }
  }
}

export default function makeApi(store) {
  return {
    addConnection({ deviceDir, connectionId }) {
      const result = getMatchingConnection({ store, deviceDir, connectionId });

      if (result) {
        const { matchingDevice, matchingConnection } = result;

        if (!matchingConnection) {
          matchingDevice.connect.push(connectionId.toLowerCase());
          matchingDevice.connect.sort();
          store.announceStateChange();
        }
      }
    },

    removeConnection({ deviceDir, connectionId }) {
      const result = getMatchingConnection({ store, deviceDir, connectionId });

      if (result) {
        const { matchingDevice, matchingConnection } = result;

        if (matchingConnection) {
          matchingDevice.connect = matchingDevice.connect.filter(entry => entry.toLowerCase() != connectionId.toLowerCase());
          store.announceStateChange();
        }
      }
    },

    updateConnection({ deviceDir, connectionId, newConnectionId }) {
      const result = getMatchingConnection({ store, deviceDir, connectionId });

      if (result) {
        const { matchingDevice, matchingConnection } = result;

        if (matchingConnection) {
          matchingDevice.connect = matchingDevice.connect.filter(entry => entry.toLowerCase() != connectionId.toLowerCase());
          matchingDevice.connect.push(newConnectionId.toLowerCase());
          matchingDevice.connect.sort();
          store.announceStateChange();
        }
      }
    }
  };
}
