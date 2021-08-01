export default function localize(program) {
  switch (program.lang()) {
    case 'sl':
      return { todayStr: 'Danes', tomorrowStr: 'Jutri', nowStr: 'zdaj', inStr: 'čez', atStr: 'ob' };
    default:
      return { todayStr: 'Today', tomorrowStr: 'Tomorrow', nowStr: 'now', inStr: 'in', atStr: 'at' };
  }
}
