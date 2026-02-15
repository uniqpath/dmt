import { parse, isBefore, isAfter, addMinutes, addHours, subHours } from '../dateFnsCompacted/index.js';
import PT from './salat_times.js';

function getTimes(location, time = new Date()) {
  const times = PT.getTimes(time, location);
  return { sunrise: times.sunrise, sunset: times.sunset };
}

function isDaylight(location, currentTime = new Date()) {
  const { sunrise, sunset } = getTimes(location, currentTime);

  const sunriseMoment = parse(sunrise, 'HH:mm', new Date());
  const sunsetMoment = parse(sunset, 'HH:mm', new Date());

  return isBefore(sunriseMoment, currentTime) && isAfter(sunsetMoment, currentTime);
}

function isDark(location, currentTime = new Date()) {
  return !isDaylight(location, currentTime);
}

function isNight(location, currentTime = new Date()) {
  const { sunrise } = getTimes(location, currentTime);
  const sunriseMoment = parse(sunrise, 'HH:mm', new Date());
  return isAfter(sunriseMoment, currentTime);
}

function isEvening(location, currentTime = new Date()) {
  const { sunset } = getTimes(location, currentTime);
  const sunsetMoment = parse(sunset, 'HH:mm', new Date());
  return isBefore(subHours(sunsetMoment, 2), currentTime);
}

function isLateEvening(location, currentTime = new Date()) {
  const { sunset } = getTimes(location, currentTime);
  const sunsetMoment = parse(sunset, 'HH:mm', new Date());
  return isBefore(addMinutes(sunsetMoment, 0), currentTime);
}

export { getTimes, isDaylight, isDark, isNight, isEvening, isLateEvening };
