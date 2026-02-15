import * as dmt from 'dmt/common';

import wpaStatus from './lib/wpaCliStatus.js';
import macosAirport from './lib/macosAirport.js';

export default function wifiAccessPointMAC() {
  if (dmt.isMacOS()) {
    return new Promise((success, reject) => {
      reject();
    });
  }

  if (dmt.isLinux()) {
    return wpaStatus();
  }

  if (dmt.isWindows()) {
    console.log('TODO');
  }
}
