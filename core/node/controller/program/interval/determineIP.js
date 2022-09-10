import os from 'os';

import { networkInterfaces } from 'dmt/net';

import determineWifiAP from './determineWifiAP';

import { push } from 'dmt/notify';

import { log, accessPointIP, apMode, colors } from 'dmt/common';

import checkForLocalOnlyIpAndRebootDevice from './checkForLocalOnlyIpAndRebootDevice';

const BOOT_LIMIT_SECONDS = 60;
const NETWORK_WAIT_SECONDS = 3 * BOOT_LIMIT_SECONDS;

let deliverBootMessages = os.uptime() < BOOT_LIMIT_SECONDS;

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export default function determineIP(program) {
  if (apMode()) {
    const ip = accessPointIP;

    if (program.store('device').get('ip') != ip) {
      program.store('device').update({ ip });
    }
  } else {
    networkInterfaces()
      .then(interfaces => {
        let ip;
        let gatewayIp;

        if (interfaces && interfaces.length >= 1) {
          ip = interfaces[0].ip_address;
          gatewayIp = interfaces[0].gateway_ip;
        }

        if (ip && deliverBootMessages && os.uptime() < NETWORK_WAIT_SECONDS) {
          deliverBootMessages = false;

          const reason = program.store('rebootReason').get();

          determineWifiAP(program).then(() => {
            const connectedWifiAP = program.network.connectedWifiAP();
            const msg = `📟 BOOTED ${ip}${connectedWifiAP ? ` ${connectedWifiAP}` : ''}${isEmpty(reason) ? '' : ` (${reason})`}`;

            push.notify(msg);
            log.green(msg);

            if (isEmpty(reason)) {
              program.nearbyNotification({ msg, ttl: 20, color: '#009D65' });
            } else {
              program.store('rebootReason').remove({ announce: false });
              program.nearbyNotification({ msg, ttl: 30, color: '#A3229B' });
            }
          });
        }

        const prevIp = program.store('device').get('ip');

        checkForLocalOnlyIpAndRebootDevice({ program, ip, prevIp });

        if (prevIp != ip) {
          program.store('device').update({ ip });

          if (ip) {
            log.cyan(`Assigned IP: ${colors.yellow(ip)}`);

            determineWifiAP(program);
          } else {
            log.yellow('⚠️  Device currently does not have any IP address assigned');
          }
        }

        if (program.store('device').get('gatewayIp') != gatewayIp) {
          program.store('device').update({ gatewayIp });
        }
      })
      .catch(e => {
        program.store('device').removeKeys(['ip', 'gatewayIp'], { announce: false });
      });
  }
}
