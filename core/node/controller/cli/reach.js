import colors from 'colors';
import { ipcClient } from 'dmt/cli';

import dmt from 'dmt/bridge';
const { compareValues, normalizeMac } = dmt.util;

const args = process.argv.slice(2);

const action = 'reach';
const payload = args.slice(1).join(' ');

ipcClient({ actorName: 'controller', action, payload })
  .then(reach => {
    console.log(reach);
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
