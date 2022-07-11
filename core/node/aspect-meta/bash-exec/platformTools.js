import * as dmt from 'dmt/common';

import { wpaStatus, macosAirport } from './otherScripts';

function wifiAccessPointMAC() {
  if (dmt.isMacOS()) {
    return macosAirport();
  }

  if (dmt.isLinux()) {
    return wpaStatus();
  }

  if (dmt.isWindows()) {
    console.log('TODO');
  }
}

export default { wifiAccessPointMAC };
