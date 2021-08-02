import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;
import fs from 'fs';

import { push } from 'dmt/notify';

export default function server(program) {
  if (fs.existsSync(dmt.dmtSocket)) {
    fs.unlinkSync(dmt.dmtSocket);
  }

  const ser = new dmt.ipc();

  ser.listen({ path: dmt.dmtSocket }, e => {
    if (e) throw e;

    log.yellow(`DMT IPC listening on ${colors.gray(dmt.dmtSocket)}`);
  });

  ser.on('stopping', payload => {
    log.write('dmt-proc is stopping ... ');
  });
}
