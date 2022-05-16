import { log, colors, ipc, dmtSocket } from 'dmt/common';

import fs from 'fs';

import { push } from 'dmt/notify';

export default function server(program) {
  if (fs.existsSync(dmtSocket)) {
    fs.unlinkSync(dmtSocket);
  }

  const ser = new ipc();

  ser.listen({ path: dmtSocket }, e => {
    if (e) throw e;

    log.yellow(`DMT IPC listening on ${colors.gray(dmtSocket)}`);
  });

  ser.on('stopping', payload => {
    log.write('dmt-proc is stopping ... ');
  });
}
