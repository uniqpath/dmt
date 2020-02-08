import dmt from 'dmt-bridge';
const { def } = dmt;

import sambaMount from './lib/samba';

function init(program) {
  if (program.network.try('samba.automount')) {
    const sambaDef = program.network.def.samba;

    for (const share of def.listify(sambaDef.automount.share)) {
      sambaMount({ share: def.id(share), mountpoint: sambaDef.automount.mountpoint, serverIp: sambaDef.server, writable: share.writable });
    }
  }
}

export { init };
