import { wifiAccessPointMAC } from 'dmt/device-control';

import { push } from 'dmt/notify';

import { log, identifyDeviceByMac, isRPi, timeutils } from 'dmt/common';

const { ONE_DAY } = timeutils;

const RETRY_DELAY = 500;

function reportWifiChangeOnRPi({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown }) {
  const { ip } = program.slot('device').get();

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

      setTimeout(() => {
        push.ttl(ONE_DAY).notify(msg);
      }, 2000);
    }, RETRY_DELAY);
  } else {
    countdown -= 1;

    if (countdown > 0) {
      setTimeout(() => {
        reportWifiChangeOnRPi({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown });
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
          const { wifiAP: currentWifiAP, apssid: currentApssid } = program.slot('device').get();

          const wifiAP = identifyDeviceByMac(apssid)?.name;

          if (isRPi() && currentApssid && currentApssid != apssid) {
            setTimeout(() => {
              reportWifiChangeOnRPi({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown: 10 });
            }, 2 * RETRY_DELAY);
          }

          const deviceState = program.slot('device').get();

          program.slot('device').update({ apssid, wifiAP }, { announce: false });

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
