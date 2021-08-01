import dmt from 'dmt/common';
import { platformTools } from 'dmt/bash-exec';

import { push } from 'dmt/notify';

const { log, identifyDeviceByMac } = dmt;
const { wifiAccessPointMAC } = platformTools;

const RETRY_DELAY = 500;

function reportChange({ program, currentApssid, apssid, currentWifiAP, wifiAP, countdown }) {
  const { ip } = program.store('device').get();

  if (ip) {
    setTimeout(() => {
      const msg = `📶 ${program.device.id}: ${currentWifiAP || ''} ${currentApssid} → ${wifiAP || ''} ${apssid}`.replace(/\s+/g, ' ');
      log.gray(msg);

      if (dmt.isRPi()) {
        push.notify(msg);
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
        const currentWifiAP = program.store('device').get().wifiAP;
        const currentApssid = program.store('device').get().apssid;

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
