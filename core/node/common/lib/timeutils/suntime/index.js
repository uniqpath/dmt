import { parse, isBefore, isAfter, addHours, subHours } from '../dateFnsCompacted/index.js';
import PT from './salat_times.js';

function getTimes(location, time = new Date()) {
  const times = PT.getTimes(time, location);
  return { sunrise: times.sunrise, sunset: times.sunset };
}

function isDaylight(location, currentTime = new Date()) {
  const { sunrise, sunset } = this.getTimes(location, currentTime);

  const sunriseMoment = parse(sunrise, 'HH:mm', new Date());
  const sunsetMoment = parse(sunset, 'HH:mm', new Date());

  return isBefore(sunriseMoment, currentTime) && isAfter(sunsetMoment, currentTime);
}

function isNight(location, currentTime = new Date()) {
  const { sunrise } = this.getTimes(location, currentTime);
  const sunriseMoment = parse(sunrise, 'HH:mm', new Date());
  return isBefore(currentTime, sunriseMoment);
}

function isEvening(location, currentTime = new Date()) {
  const { sunset } = this.getTimes(location, currentTime);
  const sunsetMoment = parse(sunset, 'HH:mm', new Date());
  return isBefore(subHours(sunsetMoment, 2), currentTime);
}

function isLateEvening(location, currentTime = new Date()) {
  const { sunset } = this.getTimes(location, currentTime);
  const sunsetMoment = parse(sunset, 'HH:mm', new Date());
  return isBefore(addHours(sunsetMoment, 1), currentTime);
}

export { getTimes, isDaylight, isNight, isEvening, isLateEvening };
