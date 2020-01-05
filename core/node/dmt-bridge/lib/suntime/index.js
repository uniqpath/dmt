const moment = require('moment');
const PT = require('./salat_times');

function getTimes(location, time = new Date()) {
  const times = PT.getTimes(time, location);
  return { sunrise: times.sunrise, sunset: times.sunset };
}

function isDaylight(location, currentTime = new Date()) {
  const { sunrise, sunset } = this.getTimes(location, currentTime);

  const sunriseMoment = moment(sunrise, 'h:m');
  const sunsetMoment = moment(sunset, 'h:m');

  return sunriseMoment.isBefore(moment(currentTime)) && sunsetMoment.isAfter(moment(currentTime));
}

function isNight(location, currentTime = new Date()) {
  const { sunrise } = this.getTimes(location, currentTime);
  const sunriseMoment = moment(sunrise, 'h:m');
  return moment(currentTime).isBefore(sunriseMoment);
}

function isEvening(location, currentTime = new Date()) {
  const { sunset } = this.getTimes(location, currentTime);
  const sunsetMoment = moment(sunset, 'h:m');
  return sunsetMoment.subtract(2, 'hours').isBefore(moment(currentTime));
}

function isLateEvening(location, currentTime = new Date()) {
  const { sunset } = this.getTimes(location, currentTime);
  const sunsetMoment = moment(sunset, 'h:m');
  return sunsetMoment.add(1, 'hours').isBefore(moment(currentTime));
}

module.exports = {
  getTimes,
  isDaylight,
  isNight,
  isEvening,
  isLateEvening
};

if (require.main === module) {
  const PT = require('./salat_times');
  var times = PT.getTimes(new Date(), [46.6625, 16.1663889]);
  console.log(times.sunrise);
  console.log(times.sunset);
}
