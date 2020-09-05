import dmt from 'dmt/bridge';

const { log } = dmt;

import mapToLocal from './lib/mapToLocal';

import checkServerSambaSharesConfig from './lib/checkServerSambaSharesConfig';
import prepareMountpoints from './lib/prepareMountpoints';
import mount from './lib/mount';

function init(program) {
  checkServerSambaSharesConfig();

  if (dmt.isLinux()) {
    program.on('tick', () => {
      prepareMountpoints().forEach(mountInfo => mount(mountInfo));
    });
  }

  program.mapToLocal = mapToLocal;
}

export { init };
