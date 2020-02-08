function removeStaleNearbySensorsData(program) {
  const { nearbySensors } = program.state;

  const dataStaleSeconds = 35;

  if (nearbySensors) {
    for (const [id, sensorInfo] of Object.entries(nearbySensors)) {
      const { lastUpdateAt } = sensorInfo;

      if (!lastUpdateAt || lastUpdateAt < Date.now() - dataStaleSeconds * 1000) {
        program.removeStoreElement({ storeName: 'nearbySensors', key: id }, { announce: false });
      }
    }
  }
}

export default removeStaleNearbySensorsData;
