let testCount = 0;
let testCountResetTimeout;

function handleMqttEvent({ program, topic, msg }) {
  if (topic == 'iot' && msg == 'test') {
    const ttl = 10;

    clearTimeout(testCountResetTimeout);
    testCount += 1;
    testCountResetTimeout = setTimeout(() => {
      testCount = 0;
    }, ttl * 1000);

    program.showNotification({ msg: `IOT TEST ${testCount}`, ttl, color: '#2298A4' });
  }
}

export { handleMqttEvent };
