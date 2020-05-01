import dates from 'date-fns';
import PT from './salat_times';

function getTimes(location, time = new Date()) {
  const times = PT.getTimes(time, location);
  return { sunrise: times.sunrise, sunset: times.sunset };
}

function isDaylight(location, currentTime = new Date()) {
  const { sunrise, sunset } = this.getTimes(location, currentTime);

  const sunriseMoment = dates.parse(sunrise, 'HH:mm', new Date());
  const sunsetMoment = dates.parse(sunset, 'HH:mm', new Date());

  return dates.isBefore(sunriseMoment, currentTime) && dates.isAfter(sunsetMoment, currentTime);
}

function isNight(location, currentTime = new Date()) {
  const { sunrise } = this.getTimes(location, currentTime);
  const sunriseMoment = dates.parse(sunrise, 'HH:mm', new Date());
  return dates.isBefore(currentTime, sunriseMoment);
}

function isEvening(location, currentTime = new Date()) {
  const { sunset } = this.getTimes(location, currentTime);
  const sunsetMoment = dates.parse(sunset, 'HH:mm', new Date());
  return dates.isBefore(dates.subHours(sunsetMoment, 2), currentTime);
}

function isLateEvening(location, currentTime = new Date()) {
  const { sunset } = this.getTimes(location, currentTime);
  const sunsetMoment = dates.parse(sunset, 'HH:mm', new Date());
  return dates.isBefore(dates.addHours(sunsetMoment, 1), currentTime);
}

export { getTimes, isDaylight, isNight, isEvening, isLateEvening };
