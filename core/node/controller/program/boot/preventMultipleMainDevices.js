import { log, colors, devices } from 'dmt/common';

export default function preventMultipleMainDevices() {
  const mainDevices = devices()
    .map(({ _coredata }) => _coredata)
    .filter(({ mainDevice }) => mainDevice);

  if (mainDevices.length > 1) {
    throw new Error(`Multiple main devices: ${colors.magenta(mainDevices.map(({ deviceName }) => deviceName))} (there can be at most one!)`);
  }

  if (mainDevices.length == 1) {
    const mainDevice = mainDevices[0];
    const thisStr = mainDevice.thisDevice ? colors.gray(' (this)') : '';
    log.cyan(`${colors.green('✍️')}  mainDevice: ${colors.magenta(mainDevice.deviceName)}${thisStr}`);
  } else {
    log.yellow('⚠️  mainDevice is not defined');
    log.gray("You won't be able to edit device configurations from Device Management GUIs (coming soon)");
    log.green(
      `Solution: add ${colors.magenta('main: true')} key (top-level) to ${colors.cyan('device.def')} of your main device ${colors.cyan('(probably PC)')}`
    );
  }
}
