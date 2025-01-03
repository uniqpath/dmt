function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function localize(program) {
  switch (program.lang()) {
    case 'sl':
      return {
        capitalizeFirstLetter,
        strToday: 'Danes',
        strTomorrow: 'Jutri',
        strNow: 'zdaj',
        strAnd: 'in',
        strIn: 'čez',
        strAt: 'ob',
        strLastTime: 'zadnjič',
        strLastDay: 'zadnji dan',
        strOneMoreDay: 'še samo jutri',
        strReminder: 'opomnik',
        strNewRegimeFromTomorrow: 'Od jutri nov razpored',
        arrDaysOfWeek: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
      };
    default:
      return {
        capitalizeFirstLetter,
        strToday: 'Today',
        strTomorrow: 'Tomorrow',
        strNow: 'now',
        strAnd: 'and',
        strIn: 'in',
        strAt: 'at',
        strLastTime: 'last time',
        strLastDay: 'last day',
        strOneMoreDay: 'one more day',
        strReminder: 'reminder',
        strNewRegimeFromTomorrow: 'New schedule starting tomorrow',
        arrDaysOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      };
  }
}
