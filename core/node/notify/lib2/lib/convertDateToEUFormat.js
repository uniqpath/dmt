export default function convertDateToEUFormat(date, defaultYear) {
  if (date.match(/^\d\d\d\d[/-]\d?\d[/-]\d?\d$/)) {
    const [year, month, day] = date.replaceAll('/', '-').split('-');
    return `${day}.${month}.${year}`;
  }

  if (date.match(/^\d?\d[/-]\d?\d$/)) {
    const [month, day] = date.replaceAll('/', '-').split('-');
    if (!defaultYear) {
      throw new Error(`Wrong date format: ${date}, no default year provided`);
    }
    return `${day}.${month}.${defaultYear}`;
  }

  if (date.match(/^\d?\d\.\d?\d\.?$/)) {
    const [day, month] = date.split('.');
    if (!defaultYear) {
      throw new Error(`Wrong date format: ${date}, no default year provided`);
    }
    return `${day}.${month}.${defaultYear}`;
  }

  if (date.match(/^\d?\d\.\d?\d\.\d\d\d\d$/)) {
    return date;
  }

  throw new Error(`Wrong date format: ${date}`);
}
