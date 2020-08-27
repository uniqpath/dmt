import dmt from 'dmt/bridge';
const { scan } = dmt;

import fs from 'fs';
import path from 'path';

class ZetaBalances {
  constructor() {
    this.balances = {};

    const snapshotPath = path.join(dmt.deviceDir(), 'data/zeta_balances.csv');

    if (fs.existsSync(snapshotPath)) {
      for (const line of scan.readFileLines(snapshotPath)) {
        if (line.trim() != '') {
          const [address, value, delegated] = line.split(';');
          this.balances[address.toLowerCase()] = { value, delegated: delegated == 'true' };
        }
      }
    }
  }

  getBalance(ethAddress) {
    return this.balances[ethAddress.toLowerCase()];
  }
}

export default ZetaBalances;
