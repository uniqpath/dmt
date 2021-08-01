import { def, suntime, device as _device } from 'dmt/common';

const _months = {
  eng: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  sl: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']
};

const _daynames = {
  eng: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  sl: ['NED', 'PON', 'TOR', 'SRE', 'ČET', 'PET', 'SOB']
};

let device;

function determineTimeAndDate({ latlng, lang }) {
  if (!device) {
    device = _device({ onlyBasicParsing: true });
  }

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

export default determineTimeAndDate;
