import { def, colors2, isDevMachine } from 'dmt/common';

import * as sensorMsg from '../lib/sensorMessageFormats';
const FAKE_DATA_ON_DEV_MACHINE = false;

const updateFrequencyMin = 2;
const dataStaleMin = 2;

const historicReadings = [];
const historicDataStaleIfNoReadingForMin = 5 * updateFrequencyMin;
const lookbackWindowMin = 60;

const keepNumHistoric = Math.round(lookbackWindowMin / updateFrequencyMin);

const tempDirectionDiff = 1;
const tempDirectionStickinessMin = 15;

function onProgramTick(program) {}

function setup(program) {
  if (FAKE_DATA_ON_DEV_MACHINE && isDevMachine()) {
    const now = Date.now();

    const env = program.store('environment');

    env.set([], { announce: false });

    for (let i = 0; i < 23; i++) {
      const temperature = -50 + i * 5;

      const bgColor = colors2.mapTemperatureToRGB(temperature);
      const color = colors2.invertColor(bgColor);

      const data = {
        humidity: 0,
        temperature,
        tempPrecise: temperature,
        tempUnit: 'C',
        bgColor,
        color,
        timestamp: now,
        updateAfter: now + updateFrequencyMin * 60 * 1000,
        expireAt: now + dataStaleMin * 60 * 1000
      };

      env.push(data, { announce: false });
    }

    env.sortArray(
      (a, b) => {
        return b.temperature - a.temperature;
      },
      { announce: false }
    );
  }
}

function temperatureDirection(historicReadings) {
  const blank = { symbol: '' };

  if (historicReadings.length < 2) {
    return blank;
  }

  const latestReading = historicReadings[historicReadings.length - 1];
  const prevReading = historicReadings[historicReadings.length - 2];

  if (latestReading.timestamp - prevReading.timestamp > historicDataStaleIfNoReadingForMin * 60 * 1000) {
    historicReadings = [latestReading];
    return blank;
  }

  const direction = calcDirection();
  if (direction) {
    return direction;
  }

  if (prevReading.tempDirection) {
    const { tempDirectionUpdateAt } = prevReading.tempDirection;

    if (tempDirectionUpdateAt && tempDirectionUpdateAt < Date.now()) {
      return prevReading.tempDirection;
    }
  }
}

function calcDirection() {
  let monotonicRise = true;
  let monotonicFall = true;
  let prev;

  for (const reading of historicReadings) {
    if (prev) {
      if (prev.temperature > reading.temperature) {
        monotonicRise = false;
      }

      if (prev.temperature < reading.temperature) {
        monotonicFall = false;
      }
    }

    prev = reading;
  }

  const latestReading = historicReadings[historicReadings.length - 1];
  const tempDiff = latestReading.tempPrecise - historicReadings[0].tempPrecise;

  if (Math.abs(tempDiff) >= tempDirectionDiff) {
    const tempDirectionUpdateAt = Date.now() + tempDirectionStickinessMin * 60 * 1000;

    if (monotonicRise) {
      return { symbol: '⇡', tempDirectionUpdateAt };
    }

    if (monotonicFall) {
      return { symbol: '⇣', tempDirectionUpdateAt };
    }
  }
}

function handleMqttEvent({ program, topic, msg }) {
  if (FAKE_DATA_ON_DEV_MACHINE && isDevMachine()) {
    return;
  }

  if (def.isTruthy(program.device.demo)) {
    const now = Date.now();
    const environment = {
      humidity: 88,
      temperature: 18,
      tempPrecise: 18,
      tempUnit: 'C',
      timestamp: now,
      updateAfter: now + updateFrequencyMin * 60 * 1000,
      expireAt: now + dataStaleMin * 60 * 1000,
      tempDirection: { symbol: '⇡', tempDirectionUpdateAt: Date.now() }
    };

    program.store('environmentTemperature').set(environment);

    return;
  }

  const parsedMsg = sensorMsg.parse({ topic, msg });

  let sensorData;

  if (parsedMsg && parsedMsg.type == sensorMsg.Type.ENVIRONMENT) {
    sensorData = parsedMsg.data;
  }

  if (sensorData && sensorData.Temperature != undefined) {
    const now = Date.now();

    const c = program.store('device').get();
    if (c && c.environment && c.environment.timestamp) {
      if (c.environment.updateAfter && now < c.environment.updateAfter) {
        return;
      }
    }

    const sensorId = parsedMsg.id;
    const temperature = sensorData.Temperature;

    const bgColor = colors2.mapTemperatureToRGB(temperature);
    const color = colors2.invertColor(bgColor);

    const pinned = sensorId == 'Okolica';

    const data = {
      sensorId,
      pinned,
      humidity: Math.round(sensorData.Humidity),
      temperature: Math.round(temperature),
      tempPrecise: temperature,
      tempUnit: sensorData.TempUnit,
      bgColor,
      color,
      timestamp: now,
      updateAfter: now + updateFrequencyMin * 60 * 1000,
      expireAt: now + dataStaleMin * 60 * 1000
    };

    historicReadings.push(data);

    if (historicReadings.length > keepNumHistoric) {
      historicReadings.shift();
    }

    data.tempDirection = temperatureDirection(historicReadings);

    const selectorPredicate = ({ sensorId }) => sensorId == data.sensorId;

    const env = program.store('environment');

    env.setArrayElement(selectorPredicate, data, { announce: false });

    env.removeArrayElements(({ expireAt }) => expireAt < now, { announce: false });

    env.sortArray(
      (a, b) => {
        return b.temperature - a.temperature;
      },
      { announce: false }
    );

    const list = env.get();
    const pinnedReading = list.find(({ pinned }) => pinned);
    if (pinnedReading) {
      env.set([pinnedReading, ...list.filter(({ pinned }) => !pinned)], { announce: false });
    }
  }
}

export { setup, onProgramTick, handleMqttEvent };
