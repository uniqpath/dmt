import { log, isLinux, disconnectedIPAddress } from 'dmt/common';

import mapToLocal from './lib/mapToLocal';

import checkServerSambaSharesConfig from './lib/checkServerSambaSharesConfig';
import prepareMountpoints from './lib/prepareMountpoints';
import mount from './lib/mount';

function tryMount(program) {
  const { ip } = program.store('device').get();
  if (ip && !disconnectedIPAddress(ip)) {
    prepareMountpoints(program).forEach(mountInfo => mount(mountInfo));
  }
}

function init(program) {
  checkServerSambaSharesConfig();

  program.on('ready', () => {
    if (isLinux()) {
      setTimeout(() => {
        tryMount(program);

        program.on('slowtick', () => {
          tryMount(program);
        });
      }, 4000);
    }
  });

  program.mapToLocal = mapToLocal;
}

export { init };
