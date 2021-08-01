import { platformTools } from 'dmt/bash-exec';

import { push } from 'dmt/notify';

import { log, identifyDeviceByMac, isRPi } from 'dmt/common';
const { wifiAccessPointMAC } = platformTools;

const RETRY_DELAY = 500;

function reportChange({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown }) {
  const { ip } = program.store('device').get();

  if (ip) {
    setTimeout(() => {
      const msg = `📶 Wifi AP switched: ${currentWifiAP || ''} ${currentApssid} → ${wifiAP || ''} ${apssid}`.replace(/\s+/g, ' ');
      log.gray(msg);

      setTimeout(() => {
        program.notifyMainDevice({ msg });
      }, 1500);

      if (isRPi()) {
        setTimeout(() => {
          push.notify(msg);
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

        program.store('device').update({ apssid, wifiAP });

        log.debug(`Current AP MAC: ${apssid}`, { cat: 'network-detect' });
      }
    })
    .catch(e => {});
}
