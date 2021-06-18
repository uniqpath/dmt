import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

export default function getDeviceInfo() {
  const device = dmt.device();

  if (device.empty || !device.id) {
    log.red(`missing device definition, please use ${colors.green('dmt device select')}`);
    log.red('EXITING, bye ✋');
    process.exit();
  }

  return device;
}
