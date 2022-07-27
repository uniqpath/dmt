import { log, colors, devices } from 'dmt/common';

export default function preventMultipleMainServers() {
  const mainServers = devices()
    .map(({ _coredata }) => _coredata)
    .filter(({ mainServer }) => mainServer);

  if (mainServers.length > 1) {
    throw new Error(`Multiple instances of mainServer: ${colors.magenta(mainServers.map(({ deviceName }) => deviceName))} (there can be at most one!)`);
  }

  if (mainServers.length == 1) {
    const mainServer = mainServers[0];
    const thisStr = mainServer.thisDevice ? colors.gray(' (this)') : '';
    log.cyan(`${colors.green('☁️')}  mainServer ≡ ${colors.magenta(mainServer.deviceName)}${thisStr}`);
  }
}
