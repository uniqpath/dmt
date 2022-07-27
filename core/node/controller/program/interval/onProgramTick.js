import { log, isDevMachine, isDevUser, isDevPanel, apMode, colors } from 'dmt/common';

import util from 'util';

import { connect } from 'dmt/connectome';

import determineIP from './determineIP';

import determineWifiAP from './determineWifiAP';

let lanConnector;

export default function onTick(program) {
  const now = Date.now();

  program.store('notifications').removeArrayElements(el => !el.expireAt || el.expireAt < now, { announce: false });

  const deviceUpdate = {
    devMachine: isDevMachine(),
    devUser: isDevUser(),
    isDevPanel: isDevPanel(),
    apMode: apMode()
  };

  program.store('environment').removeArrayElements(el => !el.expireAt || el.expireAt < now, { announce: false });

  determineIP(program);

  determineWifiAP(program);

  program.store('device').update(deviceUpdate, { announce: false });

  program.store('log').set(log.bufferLines(log.REPORT_LINES), { announce: false });

  const primaryLanServer = program.getPrimaryLanServer();

  const port = 7780;

  const statusTxt = colors.bold().white('lanServerConn —');

  const logger = (...args) => {
    log.cyan(statusTxt, util.inspect(...args));
  };

  const terminate = () => {
    log.cyan(statusTxt, `lanConnector ${lanConnector.remoteAddress()} decommission`);
    lanConnector.decommission();
    lanConnector = undefined;
  };

  if (primaryLanServer && !primaryLanServer.thisDevice) {
    if (lanConnector && lanConnector.remoteAddress() != `ws://${primaryLanServer.ip}:${port}`) {
      terminate();
    }

    if (!lanConnector) {
      lanConnector = connect({ host: primaryLanServer.ip, port, protocol: 'dmt', verbose: false, log: logger });

      lanConnector.on('inactive_connection', () => {
        log.cyan(`${statusTxt} Inactive connection ${lanConnector.remoteAddress()}`);
      });
    }
  } else if (lanConnector) {
    terminate();
  }
}
