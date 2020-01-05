const dmt = require('dmt-bridge');
const { def, suntime } = dmt;

const _months = {
  eng: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  slo: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']
};

const _daynames = {
  eng: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  slo: ['NED', 'PON', 'TOR', 'SRE', 'ČET', 'PET', 'SOB']
};

const device = dmt.device({ onlyBasicParsing: true });

function determineTimeAndDate({ latlng, lang }) {
  let d = new Date();

  const demoDevice = def.isTruthy(device.demo);

  if (demoDevice && device.demo && device.demo.date) {
    d = new Date(device.demo.date);
  }

  const time = `${d.getHours()}:${`0${d.getMinutes()}`.slice(-2)}`;

  const months = _months[lang];
  const daynames = _daynames[lang];

  const date = `${d.getDate()}. ${months[d.getMonth()]}`;
  const dow = daynames[d.getDay()];

  const data = { time, date, dow };

  if (latlng) {
    const location = [parseFloat(latlng.split(',')[0]), parseFloat(latlng.split(',')[1])];
    const { sunrise, sunset } = suntime.getTimes(location);
    data.sunrise = sunrise;
    data.sunset = sunset;
  } else {
    data.sunrise = null;
    data.sunset = null;
  }

  if (demoDevice) {
    data.sunrise = '6:00';
    data.sunset = '22:00';
  }

  return data;
}

module.exports = { determineTimeAndDate };
