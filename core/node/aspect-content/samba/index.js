import { log, isLinux, disconnectedIPAddress } from 'dmt/common';

import mapToLocal from './lib/mapToLocal.js';

import checkServerSambaSharesConfig from './lib/checkServerSambaSharesConfig.js';
import prepareMountpoints from './lib/prepareMountpoints.js';
import mount from './lib/mount.js';

function tryMount(program) {
  const { ip } = program.slot('device').get();
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
