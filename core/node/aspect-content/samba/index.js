import dmt from 'dmt/common';

const { log } = dmt;

import mapToLocal from './lib/mapToLocal';

import checkServerSambaSharesConfig from './lib/checkServerSambaSharesConfig';
import prepareMountpoints from './lib/prepareMountpoints';
import mount from './lib/mount';

function init(program) {
  checkServerSambaSharesConfig();

  if (dmt.isLinux()) {
    program.on('slowtick', () => {
      prepareMountpoints().forEach(mountInfo => mount(mountInfo));
    });
  }

  program.mapToLocal = mapToLocal;
}

export { init };
