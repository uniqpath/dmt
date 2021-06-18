import colors from 'colors';
import dmt from 'dmt/common';
const { scan } = dmt;

import PowerMonitor from './powerMonitor';

const args = process.argv.slice(2);

let file = '/Users/david/Misc/PowerMonitoringData-Wash/power.csv';
let device;

if (args.length > 1) {
  file = args[0];
  device = args[1];
} else {
  console.log(colors.red('Missing arguments'));
  console.log();
  console.log(colors.yellow('Usage:'));
  console.log(colors.green('node simulate.js [logfile.csv] [deviceName]'));
  process.exit();
}

const pwr = new PowerMonitor(device, { idleSeconds: 2 * 60 });

console.log(colors.gray(`Log file: ${colors.white(file)}`));
console.log(colors.gray(`Monitoring device: ${colors.magenta(device)}`));
console.log();

pwr.on('start', e => {
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  const msg = `${e.device} Start at ${e.time}`;
  console.log(colors.green(msg));
});

pwr.on('finish', e => {
  const msg = `${e.device} Finished at ${e.time}`;
  console.log(colors.cyan(msg));
  console.log();
  console.log(colors.gray(`Longest idle interval during operation: ${colors.magenta(`${e.longestIdleInterval}s`)}`));
  console.log(
    colors.gray(
      `perhaps move ${colors.white('idleSeconds')} parameter closer to that for \nfaster off time detection — currently set at ${colors.yellow(
        `${e.idleSeconds}s`
      )}`
    )
  );
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log();
});

for (const line of scan.readFileLines(file)) {
  const reading = line.split(',');

  const deviceName = reading[0];

  const data = {
    Time: reading[1],
    ENERGY: {
      Current: reading[2]
    }
  };

  pwr.handleReading({ topic: `tele/${deviceName}/SENSOR`, msg: JSON.stringify(data) });
}
