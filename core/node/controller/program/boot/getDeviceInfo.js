import { log, colors, device } from 'dmt/common';

export default function getDeviceInfo() {
  if (device().empty || !device().id) {
    log.red(`missing device definition, please use ${colors.green('dmt device select')}`);
    log.yellow('EXITING, bye ✋');
    process.exit();
  }

  return device();
}
