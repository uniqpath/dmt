function removeStateChangeFalseTriggers(stateClone) {
  if (stateClone.nearbyDevices) {
    for (const deviceInfo of Object.values(stateClone.nearbyDevices)) {
      delete deviceInfo.staleDetectedAt;
      delete deviceInfo.lastSeenAt;
    }
  }

  delete stateClone.integrations;
}

module.exports = removeStateChangeFalseTriggers;
