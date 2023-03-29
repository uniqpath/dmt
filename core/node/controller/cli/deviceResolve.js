import { colors, getIp, getGlobalIp, device as _device } from 'dmt/common';

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log(colors.red('Missing arguments'));
  process.exit();
}

const arg = args.shift(1);

const deviceName = arg.startsWith('@') ? arg.replace('@', '') : arg;

const ip = getIp({ deviceName });
if (ip.error) {
  console.error(ip.error);
  process.exit();
}

const globalIp = getGlobalIp({ deviceName });

console.log(`name: ${deviceName}`);
console.log(`ip: ${ip}`);
if (globalIp && !globalIp.error) {
  console.log(`globalIp: ${globalIp}`);
}

const device = _device({ deviceName, onlyBasicParsing: true });

if (device && device.try('network.user')) {
  console.log(`user: ${device.network.user}`);
}

if (device && device.try('network.id')) {
  console.log(`network: ${device.network.id}`);
}

if (device && device.try('network.globalSSHPort')) {
  console.log(`globalSSHPort: ${device.network.globalSSHPort}`);
}
