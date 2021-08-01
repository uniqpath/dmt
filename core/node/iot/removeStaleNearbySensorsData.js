function removeStaleNearbySensorsData(program) {
  const nearbySensors = program.store('nearbySensors').get();

  const dataStaleSeconds = 35;

  if (nearbySensors) {
    for (const [id, sensorInfo] of Object.entries(nearbySensors)) {
      const { lastUpdateAt } = sensorInfo;

      if (!lastUpdateAt || lastUpdateAt < Date.now() - dataStaleSeconds * 1000) {
        program.store('nearbySensors').removeKey(id, { announce: false });
      }
    }
  }
}

export default removeStaleNearbySensorsData;
