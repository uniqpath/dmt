import dmt from 'dmt/common';

const { def } = dmt;

import * as sensorMsg from '../lib/sensorMessageFormats';
const updateFrequencyMin = 2;
const dataStaleMin = 2;

const historicReadings = [];
const historicDataStaleIfNoReadingForMin = 5 * updateFrequencyMin;
const lookbackWindowMin = 60;

const keepNumHistoric = Math.round(lookbackWindowMin / updateFrequencyMin);

const tempDirectionDiff = 1;
const tempDirectionStickinessMin = 15;

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

function handleIotEvent({ program, topic, msg }) {
  if (def.isTruthy(program.device.demo)) {
    const now = Date.now();
    const environment = {
      humidity: 88,
      temperature: 18,
      tempPrecise: 18,
      tempUnit: 'C',
      timestamp: now,
      updatedAt: now + updateFrequencyMin * 60 * 1000,
      expireAt: now + dataStaleMin * 60 * 1000,
      tempDirection: { symbol: '⇡', tempDirectionUpdateAt: Date.now() }
    };

    program.store.replaceSlot('environment', environment);

    return;
  }

  const parsedMsg = sensorMsg.parse({ topic, msg });

  let weatherData;

  if (parsedMsg && parsedMsg.type == sensorMsg.Type.ENVIRONMENT && parsedMsg.id == 'TempOutside') {
    weatherData = parsedMsg.data;
  }

  if (weatherData) {
    const now = Date.now();

    const c = program.state().device;
    if (c && c.environment && c.environment.timestamp) {
      if (c.environment.updatedAt && now < c.environment.updatedAt) {
        return;
      }
    }

    const environment = {
      humidity: Math.round(weatherData.Humidity),
      temperature: Math.round(weatherData.Temperature),
      tempPrecise: weatherData.Temperature,
      tempUnit: weatherData.TempUnit,
      timestamp: now,
      updatedAt: now + updateFrequencyMin * 60 * 1000,
      expireAt: now + dataStaleMin * 60 * 1000
    };

    if (environment.temperature) {
      historicReadings.push(environment);

      if (historicReadings.length > keepNumHistoric) {
        historicReadings.shift();
      }

      environment.tempDirection = temperatureDirection(historicReadings);
    }

    program.store.replaceSlot('environment', environment);
  }
}

export { handleIotEvent };
