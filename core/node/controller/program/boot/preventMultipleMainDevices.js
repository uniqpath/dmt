import dmt from 'dmt/bridge';
const { log } = dmt;

import colors from 'colors';

export default function preventMultipleMainDevices() {
  const mainDevices = dmt
    .devices()
    .map(({ _coredata }) => _coredata)
    .filter(({ mainDevice }) => mainDevice);

  if (mainDevices.length > 1) {
    throw new Error(`Multiple main devices, there can be at most one!\n${colors.gray(mainDevices)}`);
  }

  if (mainDevices.length == 1) {
    const mainDevice = mainDevices[0];
    log.cyan(`${colors.green('✍️')}  mainDevice: ${colors.magenta(mainDevice.deviceName)}`);
  } else {
    log.yellow('⚠️  mainDevice is not defined');
    log.gray("You won't be able to edit device configurations from Device Management GUIs (coming soon)");
    log.green(
      `Solution: add ${colors.magenta('main: true')} key (top-level) to ${colors.cyan('device.def')} of your main device ${colors.cyan('(probably PC)')}`
    );
  }
}
