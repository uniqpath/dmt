import { platformTools } from 'dmt/bash-exec';

import { push, apn } from 'dmt/notify';

import { log, identifyDeviceByMac, isRPi } from 'dmt/common';
const { wifiAccessPointMAC } = platformTools;

const RETRY_DELAY = 500;

function reportChange({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown }) {
  const { ip } = program.store('device').get();

  if (ip) {
    setTimeout(() => {
      const msg = `📶 Wifi AP switched: ${currentWifiAP || ''} ${currentWifiAP ? '' : currentApssid} → ${wifiAP || ''} ${wifiAP ? '' : apssid}`.replace(
        /\s+/g,
        ' '
      );
      log.gray(msg);

      setTimeout(() => {
        program.nearbyNotification({ msg, color: '#709ec1' });
      }, 1500);

      if (isRPi()) {
        setTimeout(() => {
          apn.notify(msg);
        }, 3000);
      }
    }, RETRY_DELAY);
  } else {
    countdown -= 1;

    if (countdown > 0) {
      setTimeout(() => {
        reportChange({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown });
      }, RETRY_DELAY);
    }
  }
}

export default function determineWifiAP(program) {
  return new Promise((success, reject) => {
    wifiAccessPointMAC()
      .then(({ bssid }) => {
        if (bssid != '0:0:0:0:0:0') {
          const apssid = bssid;
          const { wifiAP: currentWifiAP, apssid: currentApssid } = program.store('device').get();

          const wifiAP = identifyDeviceByMac(apssid)?.name;

          if (currentApssid && currentApssid != apssid) {
            setTimeout(() => {
              reportChange({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown: 10 });
            }, 2 * RETRY_DELAY);
          }

          const deviceState = program.store('device').get();

          program.store('device').update({ apssid, wifiAP }, { announce: false });

          const connectedWifiAP = program.network.connectedWifiAP();

          if (connectedWifiAP && !deviceState.apssid) {
            log.white(connectedWifiAP);
          }
        }

        success();
      })
      .catch(e => {
        success();
      });
  });
}
